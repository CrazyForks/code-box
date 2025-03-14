import imageSrc from "raw:~/public/wx/xcx.jpg"
import React, { useEffect, useState } from "react"

import { TOTP } from "~utils/totp"

interface QRCodeModalProps {
  onConfirm: () => void
  onClose: () => void
}

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  content: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    position: "relative" as const,
    maxWidth: "90%",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
  },
  closeButton: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "0.5rem"
  },
  qrcodeBox: {
    width: "100%",
    textAlign: "center" as const
  },
  qrcodeImage: {
    maxWidth: "260px",
    width: "100%",
    height: "auto",
    margin: "0px auto"
  },
  scanTip: {
    textAlign: "center" as const,
    color: "#666"
  },
  captchaSection: {
    marginTop: "1.5rem",
    borderTop: "1px solid #eee",
    paddingTop: "1.5rem"
  },
  captchaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  },
  captchaText: {
    fontSize: "16px",
    letterSpacing: "2px",
    color: "#333"
  },
  inputGroup: {
    display: "flex",
    gap: "0.5rem"
  },
  input: {
    flex: 1,
    padding: "0.8rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
    "&:focus": {
      borderColor: "#007bff"
    }
  },
  verifyButton: {
    padding: "0.8rem 1.5rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#0056b3"
    }
  },
  errorText: {
    color: "#ff4444",
    fontSize: "14px",
    marginTop: "6px"
  }
}

export default function QRCodeModal({ onClose, onConfirm }: QRCodeModalProps) {
  const [inputCode, setInputCode] = useState<string>("")
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleVerify = () => {
    const formattedInput = inputCode.replace(/\s/g, "")
    const secretKey = process.env.PLASMO_PUBLIC_CODEBOX_SECRET4

    if (
      formattedInput.length == 6 &&
      TOTP.verifyTOTP(secretKey, formattedInput)
    ) {
      setIsValid(true)
      onConfirm()
    } else if (process.env.PLASMO_PUBLIC_CODEBOX_SECRET3 == formattedInput) {
      setIsValid(true)
      onConfirm()
    } else {
      setIsValid(false)
    }
  }

  // 在原有return中添加：
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <button style={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        {imageSrc && (
          <div style={styles.qrcodeBox}>
            <img
              src={imageSrc}
              alt="WeChat QR Code"
              style={styles.qrcodeImage}
            />
            <div style={styles.scanTip}>扫描二维码获取验证码</div>
          </div>
        )}

        {/* 新增验证码区域 */}
        <div style={styles.captchaSection}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                // 只允许数字和空格
                const val = e.target.value.replace(/[^\d\s]/g, "")
                setInputCode(val)
                setIsValid(null) // 清除验证状态
              }}
              placeholder="请输入验证码"
              style={{
                ...styles.input,
                borderColor: isValid === false ? "#ff4444" : "#ddd"
              }}
              maxLength={11} // 6数字+5空格
            />
            <button style={styles.verifyButton} onClick={handleVerify}>
              验证
            </button>
          </div>
          {isValid === false && (
            <div style={styles.errorText}>验证码错误，请重新输入</div>
          )}
        </div>
      </div>
    </div>
  )
}
