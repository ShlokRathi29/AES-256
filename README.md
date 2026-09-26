# AES-256 Encryption Tool

A clean, minimal web application for encrypting and decrypting data using **AES-256-GCM**.

The project focuses on a simple workflow:

```text
Encrypt
Data → AES-256-GCM → Secret Key + Ciphertext

Decrypt
Secret Key + Ciphertext → AES-256-GCM → Original Data
Features
- AES-256-GCM encryption
- Secure random 256-bit key generation
- Random 12-byte IV for every encryption
- AES-GCM authentication
- Ciphertext output
- Separate secret key
- Copy encrypted data
- Download encrypted data
- Copy secret key
- Download secret key
- Decrypt ciphertext using the secret key

How It Works
Encryption
The user enters plaintext:
Hello
The application generates:
1. A random 256-bit AES key
2. A random 12-byte IV
AES-256-GCM encrypts the plaintext.
The IV is combined with the encrypted data and encoded as Base64:
IV + Ciphertext
        ↓
      Base64
        ↓
e1WGoNTRdFxvNTmvGqft9Ag...
The user receives:
Secret Key
eTr0vrEf/oYCZVsO9rfjDXYu...

Encrypted Data
e1WGoNTRdFxvNTmvGqft9Ag...
The user does not see the IV, JSON package, or internal encryption metadata.
Decryption
The user provides:
Secret Key
+
Encrypted Data
The application:
1. Decodes the Base64 ciphertext.
2. Extracts the first 12 bytes as the IV.
3. Extracts the remaining bytes as the encrypted data.
4. Performs AES-GCM decryption.
5. Returns the original plaintext.
Example:
Secret Key
     +
Encrypted Data
     ↓
AES-256-GCM
     ↓
Hello
Project Structure
AES-256/
│
├── src/
│   ├── crypto/
│   │   ├── encrypt.ts
│   │   └── decrypt.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
Technology Stack
Frontend
- React
- TypeScript
- Vite
- CSS
Cryptography
The application uses the browser's native:
Web Crypto API
with:
AES-GCM
256-bit key
12-byte IV
No custom AES implementation is used.
Requirements
You need:
- Node.js
- npm
Check your installation:
node --version
npm --version
Installation
Clone the repository:
git clone <your-repository-url>
Enter the project:
cd AES-256
Install dependencies:
npm install
Run Locally
Start the development server:
npm run dev
Vite will provide a local address, usually:
http://localhost:5173
Open the address in your browser.
Production Build
Create a production build:
npm run build
Preview the production build:
npm run preview
Security
Secret Key
The AES-256 secret key is required to decrypt the encrypted data.
If the key is lost, the encrypted data cannot be recovered.
Treat the key as sensitive information.
IV
AES-GCM requires a unique IV for every encryption operation.
This project generates a new random 12-byte IV for every encryption.
The IV does not need to be secret.
It is stored together with the ciphertext internally so that the data can later be decrypted.
Authentication
AES-GCM provides authenticated encryption.
If the ciphertext or authentication data is modified, decryption will fail.
Web Crypto API
The application uses the browser's native Web Crypto API instead of implementing AES manually.
This reduces the risk of introducing cryptographic implementation errors.
Current Architecture
The current version performs encryption and decryption entirely in the browser.
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
No backend is currently required.
Important Limitation
This project is currently a client-side encryption and decryption application.
It does not currently provide:
- Server-side key management
- Persistent encrypted-data storage
- User authentication
- Key rotation
- Access control
- Audit logging
These can be added later if the project is converted into a full production application.
User Flow
Encrypt
Input Data
    │
    ▼
Encrypt
    │
    ├──────────────► Secret Key
    │
    └──────────────► Encrypted Data
Decrypt
Secret Key
     │
     ├──────────────┐
     │              │
     ▼              ▼
Encrypted Data    Decrypt
                    │
                    ▼
               Original Data
Design Philosophy
The application intentionally keeps the interface minimal.
The user should only need to understand:
Encrypt:
Data → Key + Ciphertext

Decrypt:
Key + Ciphertext → Data
The implementation details remain behind the interface.
There are no unnecessary dashboards, database visualizations, statistics, or technical metadata exposed to the user.
Example
Encrypt
Input:
Hello
Output:
Secret Key:
eTr0vrEf/oYCZVsO9rfjDXYu...

Encrypted Data:
e1WGoNTRdFxvNTmvGqft9Ag...
Decrypt
Input:
Secret Key:
eTr0vrEf/oYCZVsO9rfjDXYu...

Encrypted Data:
e1WGoNTRdFxvNTmvGqft9Ag...
Output:
Hello