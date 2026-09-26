# AES-256 Encryption Tool

A clean, minimal web application for encrypting and decrypting data using **AES-256-GCM**.

## Features

- AES-256-GCM authenticated encryption
- Secure random 256-bit key generation
- Random 12-byte IV for every encryption
- Base64 encoded output for easy sharing
- Copy encrypted data and secret key to clipboard
- Download encrypted data and secret key as files
- Decrypt ciphertext using the secret key
- Client-side only — nothing leaves your browser

## How It Works

### Encryption

1. The user enters plaintext.
2. The application generates:
   - A random **256-bit AES key**
   - A random **12-byte IV**
3. AES-256-GCM encrypts the plaintext.
4. The IV is prepended to the ciphertext and the result is Base64 encoded:

```text
[12-byte IV][ciphertext + auth tag]
              ↓
           Base64
              ↓
  e1WGoNTRdFxvNTmvGqft9Ag...
```

5. The user receives two separate values:

| Output | Example |
|--------|---------|
| **Secret Key** | `eTr0vrEf/oYCZVsO9rfjDXYu...` |
| **Encrypted Data** | `e1WGoNTRdFxvNTmvGqft9Ag...` |

The user does not see the IV, internal binary layout, or any encryption metadata.

### Decryption

1. The user provides the **Secret Key** and the **Encrypted Data**.
2. The application:
   1. Decodes the Base64 ciphertext.
   2. Extracts the first 12 bytes as the IV.
   3. Extracts the remaining bytes as the encrypted data.
   4. Imports the Base64 secret key as an AES-GCM key.
   5. Performs AES-GCM decryption.
   6. Returns the original plaintext.

```text
Secret Key + Encrypted Data
            ↓
       AES-256-GCM
            ↓
         Hello
```

## Project Structure

```text
AES-256/
│
├── src/
│   ├── crypto/
│   │   ├── encrypt.ts       # Encryption logic
│   │   ├── decrypt.ts       # Decryption logic
│   │   └── encoding.ts      # Base64 ↔ Uint8Array utilities
│   │
│   ├── App.tsx              # Main React component
│   ├── index.css            # Styles
│   └── main.tsx             # Entry point
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Technology Stack

### Frontend

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/) 6
- [Vite](https://vite.dev/) 8
- Vanilla CSS

### Cryptography

The application uses the browser's native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) with:

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-GCM |
| Key length | 256 bits |
| IV length | 12 bytes (96 bits) |

No custom AES implementation is used.

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/) (v18 or later)
- npm

```bash
node --version
npm --version
```

### Installation

```bash
git clone https://github.com/ShlokRathi29/AES-256.git
cd AES-256
npm install
```

### Run Locally

```bash
npm run dev
```

Vite will start a local development server, usually at:

```
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

## Security

### Secret Key

- The AES-256 secret key is **required** to decrypt the encrypted data.
- If the key is lost, the encrypted data **cannot be recovered**.
- Treat the key as sensitive information.

### IV (Initialization Vector)

- AES-GCM requires a unique IV for every encryption operation.
- This project generates a new random 12-byte IV for every encryption.
- The IV does not need to be secret.
- It is stored together with the ciphertext so that the data can later be decrypted.

### Authentication

- AES-GCM provides **authenticated encryption**.
- If the ciphertext or authentication tag is modified, decryption will fail.

### Web Crypto API

- The application uses the browser's native Web Crypto API instead of implementing AES manually.
- This reduces the risk of introducing cryptographic implementation errors.

## Architecture

The current version performs encryption and decryption entirely in the browser.

```text
User
 │
 ▼
React Application
 │
 ├── Encrypt
 │     └── Web Crypto API
 │
 └── Decrypt
       └── Web Crypto API
```

No backend is required.

## Limitations

This project is a **client-side** encryption and decryption tool. It does not provide:

- Server-side key management
- Persistent encrypted data storage
- User authentication
- Key rotation
- Access control
- Audit logging

These can be added if the project is extended into a full production application.

## Design Philosophy

The application intentionally keeps the interface minimal. The user only needs to understand:

```text
Encrypt:   Data  →  Key + Ciphertext
Decrypt:   Key + Ciphertext  →  Data
```

Implementation details remain behind the interface. There are no unnecessary dashboards, database visualizations, statistics, or technical metadata exposed to the user.