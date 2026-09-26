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

  /* =========================================
     ENCRYPT
  ========================================= */

  async function handleEncrypt() {
    resetMessages();
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

  /* =========================================
     DECRYPT
  ========================================= */

  async function handleDecrypt() {
    resetMessages();
    setDecryptedData("");

    if (!key.trim()) {
      setError("Please provide the secret encryption key.");
      return;
    }

    if (!encryptedData.trim()) {
      setError("Please provide the encrypted package.");
      return;
    }

    try {
      parseEncryptedPackage(encryptedData);

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
          "Decryption failed. Check your key and encrypted package."
        );
      }
    }
  }

  /* =========================================
     COPY
  ========================================= */

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

  /* =========================================
     DOWNLOAD KEY
  ========================================= */

  function downloadKey() {
    if (!key.trim()) {
      setError("There is no encryption key to download.");
      return;
    }

    const blob = new Blob(
      [key.trim()],
      {
        type: "text/plain",
      }
    );

    downloadFile(
      blob,
      "aes-256-secret-key.txt"
    );
  }

  /* =========================================
     DOWNLOAD ENCRYPTED PACKAGE
  ========================================= */

  function downloadEncryptedPackage() {
    setError("");

    if (!encryptedData.trim()) {
      setError(
        "There is no encrypted package to download."
      );
      return;
    }

    try {
      const packageData =
        parseEncryptedPackage(encryptedData);

      const content = JSON.stringify(
        packageData,
        null,
        2
      );

      const blob = new Blob(
        [content],
        {
          type: "application/json",
        }
      );

      downloadFile(
        blob,
        "encrypted-data.json"
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not download encrypted package."
        );
      }
    }
  }

  /* =========================================
     IMPORT ENCRYPTED PACKAGE
  ========================================= */

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
      !file.name
        .toLowerCase()
        .endsWith(".json")
    ) {
      setError(
        "Please select a JSON encrypted package."
      );

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
          "Could not import encrypted package."
        );
      }
    }

    event.target.value = "";
  }

  /* =========================================
     IMPORT KEY
  ========================================= */

  async function handleKeyImport(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setImportStatus("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = (
        await file.text()
      ).trim();

      if (!content) {
        throw new Error(
          "The key file is empty."
        );
      }

      setKey(content);

      setImportStatus(
        `✓ Imported ${file.name}`
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Could not import the key."
        );
      }
    }

    event.target.value = "";
  }

  /* =========================================
     TAMPER TEST
  ========================================= */

  async function handleTamperTest() {
    setError("");
    setTamperStatus("");

    if (!key || !encryptedData) {
      setError(
        "Encrypt some data first."
      );
      return;
    }

    try {
      const packageData =
        parseEncryptedPackage(
          encryptedData
        );

      const ciphertext =
        packageData.ciphertext;

      const replacement =
        ciphertext[0] === "A"
          ? "B"
          : "A";

      packageData.ciphertext =
        replacement +
        ciphertext.slice(1);

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

  /* =========================================
     MODE
  ========================================= */

  function switchMode(nextMode: Mode) {
    setMode(nextMode);

    resetMessages();

    setDecryptedData("");
  }

  /* =========================================
     CLEAR
  ========================================= */

  function clearAll() {
    setPlaintext("");
    setKey("");
    setEncryptedData("");
    setDecryptedData("");

    resetMessages();
  }

  function resetMessages() {
    setError("");
    setCopied("");
    setTamperStatus("");
    setImportStatus("");
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <main className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            🔐
          </div>

          <div>
            <h1>AES-256 Lab</h1>

            <p>
              Learn encryption through a
              working implementation.
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

      {/* MAIN */}

      <section className="card">

        {mode === "encrypt" ? (

          <>
            <div className="section-heading">

              <span className="step">
                01
              </span>

              <div>
                <h2>
                  Encrypt data
                </h2>

                <p>
                  Enter plaintext and
                  encrypt it using
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

            {/* SECRET KEY */}

            {key && (

              <div className="crypto-section">

                <div className="crypto-title">

                  <div>
                    <span className="crypto-icon">
                      🔑
                    </span>

                    <div>
                      <h3>
                        Secret Encryption Key
                      </h3>

                      <p>
                        Keep this key private.
                        Anyone with it can
                        decrypt the data.
                      </p>
                    </div>
                  </div>

                  <span className="secret-badge">
                    SECRET
                  </span>

                </div>

                <div className="secret-value">
                  {key}
                </div>

                <div className="button-row">

                  <button
                    className="secondary"
                    onClick={() =>
                      copyToClipboard(
                        key,
                        "key"
                      )
                    }
                  >
                    {copied === "key"
                      ? "Copied ✓"
                      : "📋 Copy Key"}
                  </button>

                  <button
                    className="secondary"
                    onClick={downloadKey}
                  >
                    💾 Download Key
                  </button>

                </div>

              </div>

            )}

            {/* ENCRYPTED PACKAGE */}

            {encryptedData && (

              <div className="crypto-section">

                <div className="crypto-title">

                  <div>
                    <span className="crypto-icon">
                      📦
                    </span>

                    <div>
                      <h3>
                        Encrypted Package
                      </h3>

                      <p>
                        This package contains
                        encrypted data and its
                        IV — not the secret key.
                      </p>
                    </div>
                  </div>

                  <span className="share-badge">
                    SHAREABLE
                  </span>

                </div>

                <pre className="package-value">
                  {encryptedData}
                </pre>

                <div className="button-row">

                  <button
                    className="secondary"
                    onClick={() =>
                      copyToClipboard(
                        encryptedData,
                        "package"
                      )
                    }
                  >
                    {copied === "package"
                      ? "Copied ✓"
                      : "📋 Copy Package"}
                  </button>

                  <button
                    className="secondary"
                    onClick={
                      downloadEncryptedPackage
                    }
                  >
                    📥 Download JSON
                  </button>

                </div>

                <button
                  className="tamper-button"
                  onClick={
                    handleTamperTest
                  }
                >
                  🧪 Test Tampering
                </button>

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

              </div>

            )}

          </>

        ) : (

          /* =====================================
             DECRYPT
          ===================================== */

          <>

            <div className="section-heading">

              <span className="step">
                02
              </span>

              <div>
                <h2>
                  Decrypt data
                </h2>

                <p>
                  You need both the secret
                  key and encrypted package.
                </p>
              </div>

            </div>

            {/* KEY */}

            <div className="import-section">

              <div className="import-header">

                <div>
                  <h3>
                    🔑 Secret Key
                  </h3>

                  <p>
                    Paste your key or import
                    the key file.
                  </p>
                </div>

                <label className="file-button">

                  📂 Import Key

                  <input
                    type="file"
                    accept=".txt,.key"
                    onChange={
                      handleKeyImport
                    }
                  />

                </label>

              </div>

              <input
                id="decrypt-key"
                value={key}
                onChange={(event) =>
                  setKey(
                    event.target.value
                  )
                }
                placeholder="Paste your AES-256 secret key"
              />

            </div>

            {/* PACKAGE */}

            <div className="import-section">

              <div className="import-header">

                <div>
                  <h3>
                    📦 Encrypted Package
                  </h3>

                  <p>
                    Paste the encrypted
                    JSON or import it.
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

            </div>

            {importStatus && (
              <div className="import-success">
                {importStatus}
              </div>
            )}

            <button
              className="primary"
              onClick={handleDecrypt}
            >
              🔓 Decrypt
            </button>

            {decryptedData && (

              <div className="decrypted-result">

                <div className="result-icon">
                  ✓
                </div>

                <div>

                  <span>
                    ORIGINAL DATA
                  </span>

                  <strong>
                    {decryptedData}
                  </strong>

                </div>

                <button
                  className="copy-button"
                  onClick={() =>
                    copyToClipboard(
                      decryptedData,
                      "decrypted"
                    )
                  }
                >
                  {copied ===
                  "decrypted"
                    ? "Copied ✓"
                    : "Copy"}
                </button>

              </div>

            )}

          </>

        )}

        {/* ERROR */}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* SECURITY CONCEPT */}

        <div className="security-note">

          <div className="security-diagram">

            <div className="security-card secret">
              <span>🔑</span>
              <strong>
                Secret Key
              </strong>
              <small>
                KEEP PRIVATE
              </small>
            </div>

            <div className="security-plus">
              +
            </div>

            <div className="security-card package">
              <span>📦</span>
              <strong>
                Encrypted Package
              </strong>
              <small>
                CAN BE STORED
              </small>
            </div>

          </div>

          <div className="security-text">

            <strong>
              Key and encrypted data
              are separate
            </strong>

            <p>
              The encrypted package
              does not contain the
              secret AES key. The key
              must be protected
              separately.
            </p>

          </div>

        </div>

        {/* HOW IT WORKS */}

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

        <button
          className="clear"
          onClick={clearAll}
        >
          Clear everything
        </button>

      </section>

      <footer>

        <span>
          AES-256-GCM
        </span>

        <span>
          •
        </span>

        <span>
          Encryption happens locally
          in your browser
        </span>

      </footer>

    </main>
  );
}

/* =========================================
   DOWNLOAD
========================================= */

function downloadFile(
  blob: Blob,
  filename: string
) {
  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/* =========================================
   PACKAGE VALIDATION
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

  if (
    packageData.version !== 1
  ) {
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

/* =========================================
   FLOW COMPONENTS
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

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function InfoBox({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="info-box">

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>
  );
}

export default App;