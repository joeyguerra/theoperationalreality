export default async robot => {
    robot.commands.register({
        id: 'or:help',
        description: 'List commands',
        aliases: ['commands', 'help'],
        args: {
            query: {type: 'string', required: false}
        },
        sideEffects: ['none'],
        handler: async ctx => {
            return 'How can I help?'
        }
    })
}