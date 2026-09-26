import { useState } from "react";
import { encryptData } from "./crypto/encrypt";
import { decryptData } from "./crypto/decrypt";

type Mode = "encrypt" | "decrypt";

function App() {
  const [mode, setMode] = useState<Mode>("encrypt");

  // Encrypt
  const [inputText, setInputText] = useState("");
  const [encryptKey, setEncryptKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");

  // Decrypt
  const [decryptKey, setDecryptKey] = useState("");
  const [decryptCiphertext, setDecryptCiphertext] =
    useState("");
  const [originalText, setOriginalText] = useState("");

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const handleEncrypt = async () => {
    setError("");

    if (!inputText.trim()) {
      showToast("Please enter text or data to encrypt.");
      return;
    }

    try {
      const result = await encryptData(inputText);

      setEncryptKey(result.key);
      setCiphertext(result.ciphertext);

      showToast("Data successfully encrypted.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Encryption failed.";

      setError(message);
      showToast(message);
    }
  };

  const handleDecrypt = async () => {
    setError("");
    setOriginalText("");

    if (!decryptKey.trim() || !decryptCiphertext.trim()) {
      showToast(
        "Please provide both the Secret Key and Encrypted Data."
      );
      return;
    }

    try {
      const result = await decryptData(
        decryptKey.trim(),
        decryptCiphertext.trim()
      );

      setOriginalText(result);

      showToast("Data successfully decrypted.");
    } catch {
      const message =
        "Decryption failed. Please check your key and ciphertext.";

      setError(message);
      showToast(message);
    }
  };

  const copyText = async (
    value: string,
    label: string
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied.`);
    } catch {
      showToast("Failed to copy text.");
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

    showToast(`Downloaded ${filename}`);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setError("");
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-name">
              AES-256
            </span>

            <span className="brand-badge">
              Secure Tool
            </span>
          </div>

          <nav className="tabs">
            <button
              className={`tab ${
                mode === "encrypt" ? "active" : ""
              }`}
              onClick={() => switchMode("encrypt")}
            >
              Encrypt
            </button>

            <button
              className={`tab ${
                mode === "decrypt" ? "active" : ""
              }`}
              onClick={() => switchMode("decrypt")}
            >
              Decrypt
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {mode === "encrypt" ? (
          <section className="view">
            <div className="page-heading">
              <h1>Encrypt data</h1>

              <p>
                Transform plaintext into secure AES-256
                encrypted string.
              </p>
            </div>

            {/* Input */}
            <div className="field">
              <label htmlFor="encrypt-input">
                Input Text
              </label>

              <textarea
                id="encrypt-input"
                rows={5}
                value={inputText}
                onChange={(e) =>
                  setInputText(e.target.value)
                }
                placeholder="Enter text or data to encrypt..."
              />
            </div>

            {/* Encrypt button */}
            <div className="action-container">
              <button
                className="primary-button"
                onClick={handleEncrypt}
              >
                Encrypt Data
              </button>
            </div>

            {/* Results */}
            {encryptKey && ciphertext && (
              <div className="results">
                {/* Key */}
                <div className="result-block">
                  <div className="result-header">
                    <label>Secret Key</label>

                    <div className="result-actions">
                      <button
                        onClick={() =>
                          copyText(
                            encryptKey,
                            "Secret key"
                          )
                        }
                      >
                        Copy
                      </button>

                      <button
                        onClick={() =>
                          downloadText(
                            encryptKey,
                            "secret-key.txt"
                          )
                        }
                      >
                        Download
                      </button>
                    </div>
                  </div>

                  <input
                    className="result-input"
                    value={encryptKey}
                    readOnly
                  />

                  <p className="warning">
                    Save this key securely. It is required
                    to decrypt your data and cannot be
                    recovered if lost.
                  </p>
                </div>

                {/* Ciphertext */}
                <div className="result-block">
                  <div className="result-header">
                    <label>
                      Encrypted Data (Ciphertext)
                    </label>

                    <div className="result-actions">
                      <button
                        onClick={() =>
                          copyText(
                            ciphertext,
                            "Encrypted data"
                          )
                        }
                      >
                        Copy
                      </button>

                      <button
                        onClick={() =>
                          downloadText(
                            ciphertext,
                            "ciphertext.txt"
                          )
                        }
                      >
                        Download
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="result-textarea"
                    rows={4}
                    value={ciphertext}
                    readOnly
                  />
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="view">
            <div className="page-heading">
              <h1>Decrypt data</h1>

              <p>
                Restore encrypted ciphertext back into
                readable original data using your secret
                key.
              </p>
            </div>

            {/* Secret Key */}
            <div className="field-group">
              <div className="field">
                <label htmlFor="decrypt-key">
                  Secret Key
                </label>

                <input
                  id="decrypt-key"
                  type="text"
                  value={decryptKey}
                  onChange={(e) =>
                    setDecryptKey(e.target.value)
                  }
                  placeholder="Enter secret key..."
                />
              </div>

              <div className="field">
                <label htmlFor="decrypt-input">
                  Encrypted Data (Ciphertext)
                </label>

                <textarea
                  id="decrypt-input"
                  rows={5}
                  value={decryptCiphertext}
                  onChange={(e) =>
                    setDecryptCiphertext(
                      e.target.value
                    )
                  }
                  placeholder="Paste encrypted ciphertext string here..."
                />
              </div>
            </div>

            {/* Decrypt */}
            <div className="action-container">
              <button
                className="primary-button"
                onClick={handleDecrypt}
              >
                Decrypt Data
              </button>
            </div>

            {/* Result */}
            {originalText && (
              <div className="decrypt-result">
                <div className="result-header">
                  <label>Original Data</label>

                  <div className="result-actions">
                    <button
                      onClick={() =>
                        copyText(
                          originalText,
                          "Original data"
                        )
                      }
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <textarea
                  className="result-textarea"
                  rows={5}
                  value={originalText}
                  readOnly
                />
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>

      {/* Toast */}
      <div
        className={`toast ${
          toast ? "toast-visible" : ""
        }`}
      >
        {toast}
      </div>
    </div>
  );
}

export default App;