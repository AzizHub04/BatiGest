const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Envoyer un email de réinitialisation de mot de passe
const envoyerEmailReset = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"BatiGest" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - BatiGest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9fafb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #dc5539; padding: 10px 14px; border-radius: 12px;">
            <span style="color: white; font-weight: 800; font-size: 18px;">BatiGest</span>
          </div>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-bottom: 12px;">Réinitialisation du mot de passe</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #dc5539; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Réinitialiser le mot de passe
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      </div>
    `,
  });
};

// Envoyer un email de confirmation de suppression
const envoyerEmailSuppression = async (email, token) => {
  const deleteUrl = `${process.env.CLIENT_URL}/confirm-delete/${token}`;

  await transporter.sendMail({
    from: `"BatiGest" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirmation de suppression de compte - BatiGest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9fafb; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #dc5539; padding: 10px 14px; border-radius: 12px;">
            <span style="color: white; font-weight: 800; font-size: 18px;">BatiGest</span>
          </div>
        </div>
        <div style="background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-bottom: 12px;">Suppression de compte</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Vous avez demandé la suppression de votre compte BatiGest. Cette action est irréversible.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${deleteUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Confirmer la suppression
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette suppression, ignorez cet email.</p>
        </div>
      </div>
    `,
  });
};
const envoyerEmailNotification = async (email, titre, message, chantierNom) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #dc5539; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">BatiGest</h1>
      </div>
      <div style="padding: 30px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 10px;">${titre}</h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">Chantier : <strong>${chantierNom}</strong></p>
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #374151; font-size: 14px; margin: 0;">${message}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background-color: #dc5539; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Ouvrir BatiGest</a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Ceci est une notification automatique de BatiGest.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"BatiGest" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `BatiGest - ${titre}`,
    html
  });
};

module.exports = { envoyerEmailReset, envoyerEmailSuppression, envoyerEmailNotification };