// pages/api/webhook.ts
import { buffer } from 'micro'
import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf.toString(), sig, endpointSecret)
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      // Save user info or payment status to Supabase here
    }

    res.status(200).json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

