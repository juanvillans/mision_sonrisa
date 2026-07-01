import transporter from "../config/mailjet.js";
import { MAIL_FROM_ADDRESS, MAIL_FROM_NAME } from "../config/env.js";

// Generic email sending function
export const sendMail = function(mailOptions) {
    return new Promise((resolve, reject) => {
        // Ensure recipient email is properly formatted
        if (mailOptions.to && typeof mailOptions.to === 'string') {
            // Validate email format
            if (!isValidEmail(mailOptions.to)) {
                return reject(new Error(`Invalid email format: ${mailOptions.to}`));
            }
        }
        
        // Create complete mail options with sender
        const completeOptions = {
            from: `"${MAIL_FROM_NAME}" <${MAIL_FROM_ADDRESS}>`,
            ...mailOptions
        };
        
        transporter.sendMail(completeOptions, function(error, info) {
            if (error) {
                console.log("Email error:", error);
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};

// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export const sendInvitationEmail = function (recipient, invitationToken, url) {
    const activationLink = `${url}/activar-cuenta?token=${invitationToken}`;
    const mailOptions = {
        to: recipient.email,
        subject: "Bienvenido a casos 1x10 - Activa tu cuenta",
        html: `
            <img src="${process.env.APP_URL }/1x10.png}" alt="casos 1x10" />
            <h3>Bienvenido a nuestra plataforma, ${recipient.first_name}!</h3>
            <p>Tu cuenta ha sido creada. Por favor haz clic en el enlace a continuación para establecer tu contraseña y activar tu cuenta:</p>
            <p><a href="${activationLink}">Activar cuenta</a></p>
            <p>Este enlace caducará en 48 horas. Si no activas tu cuenta antes de que expire el enlace, se eliminará tu usuario.</p>
            <p>Si no solicitaste esta cuenta, por favor ignora este correo electrónico.</p>
        `
    };
    
    return sendMail(mailOptions);
}

export const sendPasswordResetEmail = function (recipient, resetToken, url) {
    const resetLink = `${url}/olvide-contrasena?token=${resetToken}`;

    const mailOptions = {
        to: recipient.email,
        subject: "Casos1x10 - Solicitud de restablecimiento de contraseña",
        html: `
            <h3>Restablecimiento de Contraseña en Casos1x10</h3>
            <p>Has solicitado restablecer tu contraseña. Por favor haz clic en el enlace a continuación para restablecer tu contraseña:</p>
        <p><a href="${resetLink}">Restablecer contraseña</a></p>
            <p>El enlace caducará en 1 hora.</p>
            <p>Si no solicitaste este restablecimiento, por favor ignora este correo electrónico.</p>
        `
    };

    return sendMail(mailOptions);
}

export const sendResultsEmail = function ({ to, patientName, resultsUrl, labName }) {
    const mailOptions = {
        to: to,
        subject: `${labName} - Resultados del Laboratorio de Secretaria de Salud Falcón `,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin-bottom: 10px;">${labName}</h1>
                    <h2 style="color: #374151; margin-top: 0;">Resultados del Laboratorio de Secretaria de Salud Falcón</h2>
                </div>

                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
                        Estimado/a <strong>${patientName}</strong>,
                    </p>

                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
                        Sus resultados ya están disponibles. Puede acceder a ellos de forma segura
                        haciendo clic en el enlace a continuación:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resultsUrl}"
                           style="background-color: #2563eb; color: white; padding: 12px 30px;
                                  text-decoration: none; border-radius: 6px; font-weight: bold;
                                  display: inline-block; font-size: 16px;">
                            Ver Resultados
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                        <strong>Importante:</strong>
                    </p>
                    <ul style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                        <li>Puede descargar sus resultados en formato PDF desde la página</li>
                        <li>Si tiene alguna pregunta sobre sus resultados, consulte con su médico</li>
                    </ul>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        Este correo fue enviado automáticamente por ${labName}.<br>
                        Por favor, no responda a este mensaje.
                    </p>
                </div>
            </div>
        `
    };

    return sendMail(mailOptions);
}

export default {
    sendMail,
    sendInvitationEmail,
    sendPasswordResetEmail,
    sendResultsEmail
};
