import { useState } from "react";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";

type Mode = "encrypt" | "decrypt";

function App() {
  const [mode, setMode] = useState<Mode>("encrypt");

  const [plaintext, setPlaintext] = useState("");
  const [key, setKey] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [tamperStatus, setTamperStatus] = useState("");

  async function handleEncrypt() {
    setError("");
    setCopied("");
    setTamperStatus("");
    setDecryptedData("");

    if (!plaintext.trim()) {
      setError("Please enter some data to encrypt.");
      return;
    }

    try {
      const result = await encryptData(plaintext);

      setKey(result.key);
      setEncryptedData(result.encryptedData);
    } catch {
      setError("Encryption failed.");
    }
  }

  async function handleDecrypt() {
    setError("");
    setCopied("");
    setTamperStatus("");
    setDecryptedData("");

    if (!key.trim() || !encryptedData.trim()) {
      setError("Please provide both the key and encrypted data.");
      return;
    }

    try {
      const result = await decryptData(
        key.trim(),
        encryptedData.trim()
      );

      setDecryptedData(result);
    } catch {
      setError(
        "Decryption failed. Check your key and encrypted data."
      );
    }
  }

  async function handleTamperTest() {
    setError("");
    setTamperStatus("");

    if (!key || !encryptedData) {
      setError("Encrypt some data first.");
      return;
    }

    try {
      const packageData = JSON.parse(encryptedData);

      const ciphertext = packageData.ciphertext;

      if (!ciphertext || ciphertext.length < 2) {
        setError("Invalid ciphertext.");
        return;
      }

      // Deliberately modify one character.
      const replacement =
        ciphertext[0] === "A" ? "B" : "A";

      packageData.ciphertext =
        replacement + ciphertext.slice(1);

      await decryptData(
        key,
        JSON.stringify(packageData)
      );

      // If this executes, something unexpected happened.
      setTamperStatus(
        "⚠️ Unexpected result: tampered data was accepted."
      );
    } catch {
      setTamperStatus(
        "✓ Tampering detected — AES-GCM authentication failed."
      );
    }
  }

  async function copyToClipboard(
    value: string,
    name: string
  ) {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(name);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setCopied("");
    setTamperStatus("");
    setDecryptedData("");
  }

  function clearAll() {
    setPlaintext("");
    setKey("");
    setEncryptedData("");
    setDecryptedData("");
    setError("");
    setCopied("");
    setTamperStatus("");
  }

  return (
    <main className="app">
      {/* HEADER */}
      <header className="header">
        <div>
          <div className="brand">
            <div className="brand-icon">🔐</div>

            <div>
              <h1>AES-256 Lab</h1>
              <p>
                Learn encryption through a working
                implementation.
              </p>
            </div>
          </div>
        </div>

        <div className="mode-switch">
          <button
            className={
              mode === "encrypt" ? "active" : ""
            }
            onClick={() => switchMode("encrypt")}
          >
            Encrypt
          </button>

          <button
            className={
              mode === "decrypt" ? "active" : ""
            }
            onClick={() => switchMode("decrypt")}
          >
            Decrypt
          </button>
        </div>
      </header>

      {/* MAIN CARD */}
      <section className="card">
        {mode === "encrypt" ? (
          <>
            <div className="section-heading">
              <span className="step">01</span>

              <div>
                <h2>Encrypt data</h2>

                <p>
                  Enter plaintext and encrypt it using
                  AES-256-GCM.
                </p>
              </div>
            </div>

            <label htmlFor="plaintext">
              Data to encrypt
            </label>

            <textarea
              id="plaintext"
              value={plaintext}
              onChange={(event) =>
                setPlaintext(event.target.value)
              }
              placeholder="Enter something like: Hello"
            />

            <button
              className="primary"
              onClick={handleEncrypt}
            >
              🔐 Encrypt
            </button>

            {/* KEY */}
            {key && (
              <OutputBox
                label="Encryption Key"
                value={key}
                onCopy={() =>
                  copyToClipboard(key, "key")
                }
                copied={copied === "key"}
              />
            )}

            {/* ENCRYPTED DATA */}
            {encryptedData && (
              <>
                <OutputBox
                  label="Encrypted Data"
                  value={encryptedData}
                  onCopy={() =>
                    copyToClipboard(
                      encryptedData,
                      "encrypted"
                    )
                  }
                  copied={copied === "encrypted"}
                />

                {/* TAMPER TEST */}
                <button
                  className="tamper-button"
                  onClick={handleTamperTest}
                >
                  🧪 Test Tampering
                </button>

                {tamperStatus && (
                  <div
                    className={
                      tamperStatus.startsWith("✓")
                        ? "success"
                        : "tamper-warning"
                    }
                  >
                    {tamperStatus}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="section-heading">
              <span className="step">02</span>

              <div>
                <h2>Decrypt data</h2>

                <p>
                  Provide the encryption key and encrypted
                  package.
                </p>
              </div>
            </div>

            {/* KEY INPUT */}
            <label htmlFor="decrypt-key">
              Encryption Key
            </label>

            <input
              id="decrypt-key"
              value={key}
              onChange={(event) =>
                setKey(event.target.value)
              }
              placeholder="Paste your AES-256 key"
            />

            {/* ENCRYPTED DATA INPUT */}
            <label htmlFor="encrypted-data">
              Encrypted Data
            </label>

            <textarea
              id="encrypted-data"
              value={encryptedData}
              onChange={(event) =>
                setEncryptedData(event.target.value)
              }
              placeholder="Paste your encrypted package"
            />

            <button
              className="primary"
              onClick={handleDecrypt}
            >
              🔓 Decrypt
            </button>

            {/* DECRYPTED RESULT */}
            {decryptedData && (
              <OutputBox
                label="Original Data"
                value={decryptedData}
                onCopy={() =>
                  copyToClipboard(
                    decryptedData,
                    "decrypted"
                  )
                }
                copied={copied === "decrypted"}
              />
            )}
          </>
        )}

        {/* ERROR */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* HOW IT WORKS */}
        <div className="how-it-works">
          <div className="how-header">
            <span className="step">03</span>

            <div>
              <h2>How AES-256-GCM works</h2>

              <p>
                A simplified view of what happens during
                encryption.
              </p>
            </div>
          </div>

          <div className="flow">
            <FlowStep
              title="Plaintext"
              value='"Hello"'
            />

            <div className="flow-arrow">↓</div>

            <FlowStep
              title="UTF-8 Encoding"
              value="Text → bytes"
            />

            <div className="flow-arrow">↓</div>

            <FlowStep
              title="Cryptographic Inputs"
              value="256-bit Key + 12-byte IV"
            />

            <div className="flow-arrow">↓</div>

            <FlowStep
              title="AES-256-GCM"
              value="Encryption + Authentication"
            />

            <div className="flow-arrow">↓</div>

            <FlowStep
              title="Encrypted Package"
              value="IV + Ciphertext + Auth Tag"
            />
          </div>

          <div className="info-grid">
            <InfoBox
              title="256-bit Key"
              description="AES-256 uses a 256-bit encryption key, which is 32 bytes."
            />

            <InfoBox
              title="Random IV"
              description="A fresh 12-byte initialization vector is generated for every encryption."
            />

            <InfoBox
              title="Authentication Tag"
              description="GCM detects whether the encrypted data has been modified."
            />
          </div>
        </div>

        {/* CLEAR */}
        <button
          className="clear"
          onClick={clearAll}
        >
          Clear everything
        </button>
      </section>

      {/* FOOTER */}
      <footer>
        <span>AES-256-GCM</span>
        <span>•</span>
        <span>
          Encryption happens locally in your browser
        </span>
      </footer>
    </main>
  );
}

/* OUTPUT BOX */

function OutputBox({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="output">
      <div className="output-header">
        <label>{label}</label>

        <button
          className="copy-button"
          onClick={onCopy}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <pre>{value}</pre>
    </div>
  );
}

/* FLOW STEP */

function FlowStep({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flow-step">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* INFORMATION BOX */

function InfoBox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="info-box">
      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

export default App;