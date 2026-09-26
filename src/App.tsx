import { ChangeEvent, useState } from "react";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";

type Mode = "encrypt" | "decrypt";

type EncryptedPackage = {
  version: number;
  algorithm: string;
  iv: string;
  ciphertext: string;
};

function App() {
  const [mode, setMode] = useState<Mode>("encrypt");

  const [plaintext, setPlaintext] = useState("");
  const [key, setKey] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [tamperStatus, setTamperStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");

  async function handleEncrypt() {
    setError("");
    setCopied("");
    setTamperStatus("");
    setImportStatus("");
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
    setImportStatus("");
    setDecryptedData("");

    if (!key.trim()) {
      setError("Please provide the encryption key.");
      return;
    }

    if (!encryptedData.trim()) {
      setError("Please provide the encrypted package.");
      return;
    }

    try {
      validateEncryptedPackage(encryptedData);

      const result = await decryptData(
        key.trim(),
        encryptedData.trim()
      );

      setDecryptedData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Decryption failed. Check your key and encrypted data."
        );
      }
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
      const packageData =
        parseEncryptedPackage(encryptedData);

      const ciphertext = packageData.ciphertext;

      const replacement =
        ciphertext[0] === "A" ? "B" : "A";

      packageData.ciphertext =
        replacement + ciphertext.slice(1);

      await decryptData(
        key,
        JSON.stringify(packageData)
      );

      setTamperStatus(
        "⚠️ Unexpected result: tampered data was accepted."
      );
    } catch {
      setTamperStatus(
        "✓ Tampering detected — AES-GCM authentication failed."
      );
    }
  }

  function exportEncryptedPackage() {
    setError("");

    if (!encryptedData.trim()) {
      setError("Encrypt some data before exporting.");
      return;
    }

    try {
      const packageData =
        parseEncryptedPackage(encryptedData);

      const fileContent = JSON.stringify(
        packageData,
        null,
        2
      );

      const blob = new Blob(
        [fileContent],
        {
          type: "application/json",
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "encrypted-data.json";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not export encrypted package.");
      }
    }
  }

  async function handleImport(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setImportStatus("");
    setDecryptedData("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.type !== "application/json" &&
      !file.name.toLowerCase().endsWith(".json")
    ) {
      setError("Please select a JSON encrypted package.");
      event.target.value = "";
      return;
    }

    try {
      const content = await file.text();

      const packageData =
        parseEncryptedPackage(content);

      setEncryptedData(
        JSON.stringify(packageData)
      );

      setImportStatus(
        `✓ Imported ${file.name}`
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not import the encrypted package."
        );
      }
    }

    event.target.value = "";
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
    setImportStatus("");
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
    setImportStatus("");
  }

  return (
    <main className="app">
      <header className="header">
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

        <div className="mode-switch">
          <button
            className={
              mode === "encrypt"
                ? "active"
                : ""
            }
            onClick={() =>
              switchMode("encrypt")
            }
          >
            Encrypt
          </button>

          <button
            className={
              mode === "decrypt"
                ? "active"
                : ""
            }
            onClick={() =>
              switchMode("decrypt")
            }
          >
            Decrypt
          </button>
        </div>
      </header>

      <section className="card">
        {mode === "encrypt" ? (
          <>
            <div className="section-heading">
              <span className="step">
                01
              </span>

              <div>
                <h2>Encrypt data</h2>

                <p>
                  Enter plaintext and encrypt it
                  using AES-256-GCM.
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
                setPlaintext(
                  event.target.value
                )
              }
              placeholder="Enter something like: Hello"
            />

            <button
              className="primary"
              onClick={handleEncrypt}
            >
              🔐 Encrypt
            </button>

            {key && (
              <OutputBox
                label="Encryption Key"
                value={key}
                onCopy={() =>
                  copyToClipboard(
                    key,
                    "key"
                  )
                }
                copied={
                  copied === "key"
                }
              />
            )}

            {encryptedData && (
              <>
                <OutputBox
                  label="Encrypted Package"
                  value={encryptedData}
                  onCopy={() =>
                    copyToClipboard(
                      encryptedData,
                      "encrypted"
                    )
                  }
                  copied={
                    copied ===
                    "encrypted"
                  }
                />

                <div className="action-row">
                  <button
                    className="secondary"
                    onClick={
                      exportEncryptedPackage
                    }
                  >
                    📥 Export JSON
                  </button>

                  <button
                    className="tamper-button"
                    onClick={
                      handleTamperTest
                    }
                  >
                    🧪 Test Tampering
                  </button>
                </div>

                {tamperStatus && (
                  <div
                    className={
                      tamperStatus.startsWith(
                        "✓"
                      )
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
              <span className="step">
                02
              </span>

              <div>
                <h2>Decrypt data</h2>

                <p>
                  Provide the encryption key
                  and encrypted package.
                </p>
              </div>
            </div>

            <div className="import-box">
              <div>
                <h3>
                  Import encrypted package
                </h3>

                <p>
                  Load an exported
                  encrypted-data.json file.
                </p>
              </div>

              <label className="file-button">
                📂 Import JSON

                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={
                    handleImport
                  }
                />
              </label>
            </div>

            {importStatus && (
              <div className="import-success">
                {importStatus}
              </div>
            )}

            <label htmlFor="decrypt-key">
              Encryption Key
            </label>

            <input
              id="decrypt-key"
              value={key}
              onChange={(event) =>
                setKey(
                  event.target.value
                )
              }
              placeholder="Paste your AES-256 key"
            />

            <label htmlFor="encrypted-data">
              Encrypted Package
            </label>

            <textarea
              id="encrypted-data"
              value={encryptedData}
              onChange={(event) =>
                setEncryptedData(
                  event.target.value
                )
              }
              placeholder='Paste encrypted JSON, e.g. {"version":1,...}'
            />

            <button
              className="primary"
              onClick={handleDecrypt}
            >
              🔓 Decrypt
            </button>

            {decryptedData && (
              <OutputBox
                label="Original Data"
                value={
                  decryptedData
                }
                onCopy={() =>
                  copyToClipboard(
                    decryptedData,
                    "decrypted"
                  )
                }
                copied={
                  copied ===
                  "decrypted"
                }
              />
            )}
          </>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="how-it-works">
          <div className="how-header">
            <span className="step">
              03
            </span>

            <div>
              <h2>
                How AES-256-GCM works
              </h2>

              <p>
                A simplified view of what
                happens during encryption.
              </p>
            </div>
          </div>

          <div className="flow">
            <FlowStep
              title="Plaintext"
              value='"Hello"'
            />

            <div className="flow-arrow">
              ↓
            </div>

            <FlowStep
              title="UTF-8 Encoding"
              value="Text → bytes"
            />

            <div className="flow-arrow">
              ↓
            </div>

            <FlowStep
              title="Cryptographic Inputs"
              value="256-bit Key + 12-byte IV"
            />

            <div className="flow-arrow">
              ↓
            </div>

            <FlowStep
              title="AES-256-GCM"
              value="Encryption + Authentication"
            />

            <div className="flow-arrow">
              ↓
            </div>

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

        <div className="security-note">
          <span className="security-icon">
            🔒
          </span>

          <div>
            <strong>
              Client-side encryption
            </strong>

            <p>
              Plaintext, keys, and encrypted
              data are processed locally in
              your browser. This application
              does not send them to a server.
            </p>
          </div>
        </div>

        <button
          className="clear"
          onClick={clearAll}
        >
          Clear everything
        </button>
      </section>

      <footer>
        <span>AES-256-GCM</span>
        <span>•</span>
        <span>
          Encryption happens locally in your
          browser
        </span>
      </footer>
    </main>
  );
}

/* =========================================
   VALIDATION
========================================= */

function parseEncryptedPackage(
  value: string
): EncryptedPackage {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      "Invalid encrypted package: JSON could not be parsed."
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "Invalid encrypted package: expected a JSON object."
    );
  }

  const packageData =
    parsed as Record<string, unknown>;

  if (packageData.version !== 1) {
    throw new Error(
      "Unsupported encrypted package version."
    );
  }

  if (
    packageData.algorithm !==
    "AES-256-GCM"
  ) {
    throw new Error(
      "Unsupported encryption algorithm."
    );
  }

  if (
    typeof packageData.iv !==
      "string" ||
    !packageData.iv
  ) {
    throw new Error(
      "Invalid encrypted package: IV is missing."
    );
  }

  if (
    typeof packageData.ciphertext !==
      "string" ||
    !packageData.ciphertext
  ) {
    throw new Error(
      "Invalid encrypted package: ciphertext is missing."
    );
  }

  return {
    version: 1,
    algorithm: "AES-256-GCM",
    iv: packageData.iv,
    ciphertext:
      packageData.ciphertext,
  };
}

function validateEncryptedPackage(
  value: string
) {
  parseEncryptedPackage(value);
}

/* =========================================
   OUTPUT BOX
========================================= */

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
          {copied
            ? "Copied ✓"
            : "Copy"}
        </button>
      </div>

      <pre>{value}</pre>
    </div>
  );
}

/* =========================================
   FLOW STEP
========================================= */

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

/* =========================================
   INFO BOX
========================================= */

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