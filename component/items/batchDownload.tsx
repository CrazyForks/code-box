import { DownloadOutlined, CloudDownloadOutlined } from "@ant-design/icons"
import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

export default function BatchDownload() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function batchDownload() {
    if (loading) return

    setLoading(true)
    setMessage("正在批量下载...")

    try {
      const response = await sendToBackground({
        name: "batchDownload",
        body: {
          action: "batchDownloadAllTabs"
        }
      })

      if (response.code === 200) {
        setMessage(response.msg || "下载成功")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage(response.msg || "下载失败")
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Batch download error:", error)
      setMessage("下载失败: " + error.message)
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="item batch-download">
      <div onClick={batchDownload} style={{ cursor: loading ? "wait" : "pointer" }}>
        <span>
          <CloudDownloadOutlined
            style={{ marginRight: "5px", color: loading ? "#999" : "#1890ff" }}
          />
          批量下载所有标签页
        </span>
        <DownloadOutlined
          style={{ color: loading ? "#999" : "#52c41a", fontSize: "16px" }}
        />
      </div>
      {message && (
        <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
          {message}
        </div>
      )}
    </div>
  )
}
