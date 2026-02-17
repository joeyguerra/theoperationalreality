// Description:
//   Start a juphjacs web server.
//
// Author:
//   Joey Guerra

import { JuphjacWebServer } from 'juphjacs'
import { EventStore } from '../lib/EventStore.mjs'

// #theoperationalreality
const CHANNEL_ID = '1473352031254216828'
const eventNames = {
    'feedabk': 'Feedback',
    'page-visit': 'Page Visit'
}
export default async robot => {
    robot.eventNames = eventNames
    const dataFolder = process.env.DATA_FOLDER || 'data'
    const eventStore = new EventStore(dataFolder)
    function createDatabase () {
        return {
            async logEvent(eventType, data) {
                await eventStore.append(eventType, data)
            },
            async postNotification(eventType, data) {                
                if (robot.eventNames[eventType]) {
                    try {
                        robot.messageRoom(CHANNEL_ID, `# ${robot.eventNames[eventType]}:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\``)
                    } catch (error) {
                        robot.logger.error(`Failed to send message to chat room: ${error.message}`)
                    }
                } else {
                    robot.logger.warn(`No channel name configured for event type: ${eventType}`)
                }
            },
            eventStore
        }
    }
    class CacheService {
        constructor() {
            this.store = new Map()
        }
        get(key) {
            return this.store.get(key)
        }
        set(key, value) {
            this.store.set(key, value)
        }
    }

    // Initialize your services
    const db = await createDatabase()
    const cache = new CacheService()

    const myAppConfig = {
        appName: 'The Operational Reality',
        enableFeatureX: true,
        apiBaseUrl: 'https://theoperationalreality.com'
    }

    const server = new JuphjacWebServer({
        rootDir: process.cwd(),
        logLevel: process.env.LOG_LEVEL || 'info',
        logger: robot.logger,
        context: {
            db,
            cache,
            config: myAppConfig,
            robot
        }
    })

    await server.initialize()
    await server.start(process.env.PORT || 3000)

    process.on('SIGINT', async () => {
        console.log('Shutting down server...')
        await server.stop()
        process.exit(0)
    })
    process.on('SIGTERM', async () => {
        console.log('Shutting down server...')
        await server.stop()
        process.exit(0)
    })


}