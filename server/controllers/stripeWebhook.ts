import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const stripeWebhook = async (request: Request, response: Response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"] as string;
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret,
        );
      } catch (err: any) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
            const paymentIntent = event.data.object;
            const sessionList = await stripe.checkout.sessions.list({
                payment_intent: paymentIntent.id,
            });
            const session = sessionList.data[0];
            const { transactionId, appId } = session.metadata as { transactionId: string, appId: string };
            if (appId === 'ai-web-builder' && transactionId) {
                const transaction = await prisma.transaction.update({
                    where: { id: transactionId },
                    data: {isPaid: true},
                })
                await prisma.user.update({
                    where: { id: transaction.userId },
                    data: {
                        credits: {increment: transaction.credits}
                    }
                })
            }
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }
}