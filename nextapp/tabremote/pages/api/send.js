import { Server as IOServer } from 'socket.io'
import { Kafka } from "kafkajs"

const kafka = new Kafka({
    clientId: 'nextjs',
    brokers: ['kafka:9092'],
})

const producer = kafka.producer({
    allowAutoTopicCreation: false,
    transactionTimeout: 30000
}
)

export default async function handler(req, res) {
    await producer.connect()
    await producer.send({
        topic: 'tabremote',
        messages: [
            { key: 'command', value: req.body }
        ],
    })

    res.status(200).json({ done: true })
}
