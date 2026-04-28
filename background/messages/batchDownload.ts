import JSZip from "jszip"
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { action } = req.body

  if (action === "batchDownloadAllTabs") {
    try {
      const tabs = await chrome.tabs.query({})
      const supportedSites = [
        { pattern: "mp.weixin.qq.com", name: "weixin" },
        { pattern: "juejin.cn", name: "juejin" },
        { pattern: "csdn.net", name: "csdn" },
        { pattern: "cnblogs.com", name: "cnblogs" },
        { pattern: "jianshu.com", name: "jianshu" },
        { pattern: "segmentfault.com", name: "segmentfault" },
        { pattern: "zhihu.com", name: "zhihu" },
        { pattern: "oschina.net", name: "oschina" },
        { pattern: "51cto.com", name: "51cto" },
        { pattern: "php.net", name: "php" },
        { pattern: "jb51.net", name: "jb51" },
        { pattern: "baidu.com", name: "baidu" }
      ]

      const validTabs = tabs.filter((tab) => {
        if (!tab.url) return false
        return supportedSites.some((site) => tab.url.includes(site.pattern))
      })

      if (validTabs.length === 0) {
        res.send({ code: 0, msg: "没有找到支持的页面" })
        return
      }

      const zip = new JSZip()
      let successCount = 0
      let failCount = 0

      for (const tab of validTabs) {
        try {
          const site = supportedSites.find((s) => tab.url.includes(s.pattern))
          if (!site) continue

          const response = await chrome.tabs.sendMessage(tab.id, {
            name: `${site.name}-downloadMarkdown`,
            body: { action: "getMarkdown" }
          })

          if (response && response.markdown) {
            const title = response.title || `page-${tab.id}`
            const safeTitle = title.replace(/[<>:"/\\|?*]/g, "-")
            zip.file(`${safeTitle}.md`, response.markdown)
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          console.error(`Failed to download tab ${tab.id}:`, error)
          failCount++
        }
      }

      if (successCount === 0) {
        res.send({ code: 0, msg: "所有页面下载失败" })
        return
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const reader = new FileReader()

      reader.onload = function (event) {
        const dataUrl = event.target.result as string
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .slice(0, 19)

        chrome.downloads.download(
          {
            url: dataUrl,
            filename: `batch-download-${timestamp}.zip`
          },
          () => {
            res.send({
              code: 200,
              msg: `成功 ${successCount} 个，失败 ${failCount} 个`,
              data: { successCount, failCount, total: validTabs.length }
            })
          }
        )
      }

      reader.readAsDataURL(zipBlob)
    } catch (error) {
      console.error("Batch download error:", error)
      res.send({ code: 0, msg: error.message })
    }
  }
}

export default handler
