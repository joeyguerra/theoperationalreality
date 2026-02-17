
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class IndexPage extends Page {
    constructor (rootFolder, filePath, template, context) {
        super(rootFolder, filePath, template, context)
        this.title = 'The Operational Reality – A blog about the reality of operating a business with technology.'
        this.excerpt = ''
        this.canonical = 'https://theoperationalreality.com/index.html'
        this.image = ''
        this.published = new Date('2026-02-17')
        this.uri = '/index.html'
        this.tags = ['oprations', 'reality', 'software', 'technology', 'business']
    }

    async get(req, res) {
        const visitData = {
            url: req.url,
            method: req.method,
            userAgent: req.headers['user-agent'],
            referer: req.headers['referer'] || req.headers['referrer'],
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            timestamp: new Date().toISOString()
        }
        
        this.context.db.logEvent('page-visit', visitData).catch(err => {
            this.context.logger.error('Failed to log page visit:', err)
        })
        res.statusCode = 200
        await this.render()
        res.setHeader('Content-Type', 'text/html')
        res.end(this.content)
    }
}

export default async (rootFolder, filePath, template, context) => {
    return new IndexPage(rootFolder, filePath, template, context)
}
