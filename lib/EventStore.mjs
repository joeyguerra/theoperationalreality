import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class EventStore {
    constructor(dataFolder = path.join(process.cwd(), 'data')) {
        this.dataFolder = dataFolder
        this.filePath = path.join(dataFolder, 'events.ndjson')
    }

    async ensureFileExists() {
        try {
            await fs.mkdir(this.dataFolder, { recursive: true })
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error
            }
        }
        
        try {
            await fs.access(this.filePath)
        } catch {
            await fs.writeFile(this.filePath, '', 'utf8')
        }
    }

    async append(eventType, data) {
        await this.ensureFileExists()
        
        const event = {
            eventType,
            data,
            timestamp: new Date().toISOString(),
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        
        const line = JSON.stringify(event) + '\n'
        await fs.appendFile(this.filePath, line, 'utf8')
        return event
    }

    async *readEvents() {
        try {
            const content = await fs.readFile(this.filePath, 'utf8')
            const lines = content.split('\n').filter(line => line.trim())
            
            for (const line of lines) {
                try {
                    yield JSON.parse(line)
                } catch (error) {
                    console.error('Failed to parse event line:', line, error)
                }
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error
            }
        }
    }

    async getAllEvents() {
        const events = []
        for await (const event of this.readEvents()) {
            events.push(event)
        }
        return events
    }

    async getEventsByType(eventType) {
        const events = []
        for await (const event of this.readEvents()) {
            if (event.eventType === eventType) {
                events.push(event)
            }
        }
        return events
    }
}
