import { useState } from "react";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";
import "./index.css";

type Page = "encrypt" | "decrypt";

function App() {
  const [page, setPage] = useState<Page>("encrypt");

  const [plainText, setPlainText] = useState("");
  const [key, setKey] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [decryptedData, setDecryptedData] = useState("");

  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const [showKey, setShowKey] = useState(false);

  const handleEncrypt = async () => {
    setError("");
    setCopied("");
    setKey("");
    setEncryptedData("");
    setDecryptedData("");

    if (!plainText.trim()) {
      setError("Please enter some data to encrypt.");
      return;
    }

    try {
      const result = await encryptData(plainText);

      setKey(result.key);
      setEncryptedData(result.ciphertext);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Encryption failed."
      );
    }
  };

  const handleDecrypt = async () => {
    setError("");
    setDecryptedData("");

    if (!key.trim()) {
      setError("Please enter the secret key.");
      return;
    }

    if (!encryptedData.trim()) {
      setError("Please enter the encrypted data.");
      return;
    }

    try {
      const result = await decryptData(
        key.trim(),
        encryptedData.trim()
      );

      setDecryptedData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Decryption failed."
      );
    }
  };

  const copyToClipboard = async (
    value: string,
    type: string
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      setError("Unable to copy to clipboard.");
    }
  };

  const downloadText = (
    value: string,
    filename: string
  ) => {
    if (!value) return;

    const blob = new Blob([value], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setPlainText("");
    setKey("");
    setEncryptedData("");
    setDecryptedData("");
    setError("");
    setCopied("");
    setShowKey(false);
  };

  const handleImportKey = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();

      setKey(text.trim());
      setError("");
    } catch {
      setError("Unable to import key.");
    }

    event.target.value = "";
  };

  const handleImportEncryptedData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();

      setEncryptedData(text.trim());
      setError("");
    } catch {
      setError("Unable to import encrypted data.");
    }

    event.target.value = "";
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">🔐</div>

          <div>
            <h1>AES-256</h1>
            <p>Secure encryption</p>
          </div>
        </div>

        <div className="mode-switch">
          <button
            className={page === "encrypt" ? "active" : ""}
            onClick={() => {
              setPage("encrypt");
              setError("");
            }}
          >
            Encrypt
          </button>

          <button
            className={page === "decrypt" ? "active" : ""}
            onClick={() => {
              setPage("decrypt");
              setError("");
            }}
          >
            Decrypt
          </button>
        </div>
      </header>

      <main className="container">
        {page === "encrypt" ? (
          <>
            <section className="hero">
              <h2>Encrypt your data</h2>

              <p>
                Enter your data and generate a secure
                AES-256 encrypted value.
              </p>
            </section>

            <section className="crypto-section">
              <div className="section-header">
                <div className="section-title">
                  <span>📝</span>
                  <strong>Data</strong>
                </div>
              </div>

              <textarea
                value={plainText}
                onChange={(event) =>
                  setPlainText(event.target.value)
                }
                placeholder="Enter the data you want to encrypt..."
                rows={6}
              />

              <div className="action-row">
                <button
                  className="primary"
                  onClick={handleEncrypt}
                >
                  Encrypt
                </button>

                <button
                  className="secondary"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </section>

            {key && (
              <section className="crypto-section">
                <div className="section-header">
                  <div className="section-title">
                    <span>🔑</span>
                    <strong>Secret Key</strong>
                  </div>
                </div>

                <div className="secret-value">
                  <input
                    type={showKey ? "text" : "password"}
                    value={key}
                    readOnly
                  />

                  <button
                    className="icon-button"
                    onClick={() =>
                      setShowKey(!showKey)
                    }
                    title={
                      showKey
                        ? "Hide key"
                        : "Show key"
                    }
                  >
                    {showKey ? "🙈" : "👁"}
                  </button>
                </div>

                <div className="button-row">
                  <button
                    className="secondary"
                    onClick={() =>
                      copyToClipboard(key, "key")
                    }
                  >
                    {copied === "key"
                      ? "Copied ✓"
                      : "📋 Copy"}
                  </button>

                  <button
                    className="secondary"
                    onClick={() =>
                      downloadText(
                        key,
                        "aes-256-key.txt"
                      )
                    }
                  >
                    ⬇ Download
                  </button>
                </div>
              </section>
            )}

            {encryptedData && (
              <section className="crypto-section">
                <div className="section-header">
                  <div className="section-title">
                    <span>📦</span>
                    <strong>Encrypted Data</strong>
                  </div>
                </div>

                <div className="encrypted-value">
                  {encryptedData}
                </div>

                <div className="button-row">
                  <button
                    className="secondary"
                    onClick={() =>
                      copyToClipboard(
                        encryptedData,
                        "encrypted"
                      )
                    }
                  >
                    {copied === "encrypted"
                      ? "Copied ✓"
                      : "📋 Copy"}
                  </button>

                  <button
                    className="secondary"
                    onClick={() =>
                      downloadText(
                        encryptedData,
                        "encrypted-data.txt"
                      )
                    }
                  >
                    ⬇ Download
                  </button>
                </div>
              </section>
            )}
          </>
        ) : (
          <>
            <section className="hero">
              <h2>Decrypt your data</h2>

              <p>
                Enter your secret key and encrypted
                data to recover the original value.
              </p>
            </section>

            <section className="crypto-section">
              <div className="section-header">
                <div className="section-title">
                  <span>🔑</span>
                  <strong>Secret Key</strong>
                </div>
              </div>

              <div className="secret-value">
                <input
                  type={showKey ? "text" : "password"}
                  value={key}
                  onChange={(event) =>
                    setKey(event.target.value)
                  }
                  placeholder="Enter your secret key..."
                />

                <button
                  className="icon-button"
                  onClick={() =>
                    setShowKey(!showKey)
                  }
                  title={
                    showKey
                      ? "Hide key"
                      : "Show key"
                  }
                >
                  {showKey ? "🙈" : "👁"}
                </button>
              </div>

              <div className="button-row">
                <label className="secondary file-button">
                  Import Key
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleImportKey}
                    hidden
                  />
                </label>
              </div>
            </section>

            <section className="crypto-section">
              <div className="section-header">
                <div className="section-title">
                  <span>📦</span>
                  <strong>Encrypted Data</strong>
                </div>
              </div>

              <textarea
                value={encryptedData}
                onChange={(event) =>
                  setEncryptedData(
                    event.target.value
                  )
                }
                placeholder="Paste encrypted data..."
                rows={5}
              />

              <div className="button-row">
                <label className="secondary file-button">
                  Import Data
                  <input
                    type="file"
                    accept=".txt"
                    onChange={
                      handleImportEncryptedData
                    }
                    hidden
                  />
                </label>
              </div>
            </section>

            <section className="decrypt-action">
              <button
                className="primary"
                onClick={handleDecrypt}
              >
                Decrypt
              </button>

              <button
                className="secondary"
                onClick={handleClear}
              >
                Clear
              </button>
            </section>

            {decryptedData && (
              <section className="crypto-section result-section">
                <div className="section-header">
                  <div className="section-title">
                    <span>✓</span>
                    <strong>Original Data</strong>
                  </div>
                </div>

                <div className="decrypted-value">
                  {decryptedData}
                </div>

                <div className="button-row">
                  <button
                    className="secondary"
                    onClick={() =>
                      copyToClipboard(
                        decryptedData,
                        "decrypted"
                      )
                    }
                  >
                    {copied === "decrypted"
                      ? "Copied ✓"
                      : "📋 Copy"}
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {error && (
          <div className="error-message">
            <span>⚠</span>
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;