// import type { Server as HTTPServer } from 'http'
// import type { NextApiRequest, NextApiResponse } from 'next'
// import type { Socket as NetSocket } from 'net'
import { Server as IOServer } from 'socket.io'
import { Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: 'nextjs',
    brokers: ['kafka:9092'],
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
        console.log('Socket is already running.')
    } else {
        console.log('Socket is initializing...')

        const io = new IOServer(res.socket.server)
        res.socket.server.io = io

        io.on('connection', async (socket) => {

            await consumer.connect()
            await consumer.subscribe({ topic: 'tabremote', fromBeginning: false })

            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    console.log(
                        (message.value || "No message").toString(),
                    )

                    if (message.value) {
                        socket.broadcast.emit(topic, message.value)
                    }
                },
            })

            // socket.on( 'input-change', (msg) => {
            //   socket.broadcast.emit( 'update-input', msg )
            // })
        })
    }

    res.end()
}

export default SocketHandler
