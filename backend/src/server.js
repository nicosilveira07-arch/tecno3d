import "./load-env.js";

import app from "./app.js";

import {
    expireCheckoutSessions,
    expirePendingPaymentCheckoutSessions,
} from "./repositories/checkoutSession.repository.js";

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const CHECKOUT_CLEANUP_INTERVAL =
    60 * 1000;

const cleanupExpiredCheckoutSessions =
    async () => {
        try {
            const result =
                await expireCheckoutSessions();

            if (result.count > 0) {
                console.log(
                    `🧹 CheckoutSessions ACTIVE vencidas eliminadas: ${result.count}`
                );
            }
        } catch (error) {
            console.error(
                "❌ Error limpiando CheckoutSessions ACTIVE vencidas:",
                error
            );
        }
    };

const cleanupExpiredPendingPayments =
    async () => {
        try {
            const result =
                await expirePendingPaymentCheckoutSessions();

            if (result.count > 0) {
                console.log(
                    `🧹 CheckoutSessions PAYMENT_PENDING vencidas eliminadas: ${result.count}`
                );
            }
        } catch (error) {
            console.error(
                "❌ Error limpiando CheckoutSessions PAYMENT_PENDING vencidas:",
                error
            );
        }
    };

cleanupExpiredCheckoutSessions();
cleanupExpiredPendingPayments();

setInterval(
    cleanupExpiredCheckoutSessions,
    CHECKOUT_CLEANUP_INTERVAL
);

setInterval(
    cleanupExpiredPendingPayments,
    CHECKOUT_CLEANUP_INTERVAL
);

app.listen(PORT, HOST, () => {
    console.log(
        `🚀 Servidor iniciado en ${HOST}:${PORT}`
    );
});