import express from 'express'

const router = express.Router()

// Create Stripe Checkout session (placeholder unless env configured)
router.post('/create-checkout-session', async (req, res) => {
  try {
    const fallbackUrl = process.env.STRIPE_CHECKOUT_LINK
    const hasStripe = !!process.env.STRIPE_SECRET_KEY

    if (!hasStripe) {
      if (fallbackUrl) {
        return res.json({ url: fallbackUrl, mode: 'fallback' })
      }
      return res.status(501).json({ error: 'Billing not configured' })
    }

    // In a real setup, initialize Stripe and create a Checkout Session here.
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    // const session = await stripe.checkout.sessions.create({ ... })
    // return res.json({ url: session.url })

    return res.status(501).json({ error: 'Stripe configured but endpoint not implemented' })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

export default router


