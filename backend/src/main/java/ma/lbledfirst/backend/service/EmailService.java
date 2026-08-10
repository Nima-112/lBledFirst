package ma.lbledfirst.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

// Envoi asynchrone (@Async, cf. AsyncConfig) : un email lent ou un SMTP mal
// configuré ne doit jamais faire échouer ni ralentir register()/forgotPassword().
// En cas d'erreur d'envoi, on logue seulement — l'inscription ou la demande de
// réinitialisation reste valide côté application.
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Async
    public void sendVerificationEmail(String toEmail, String toName, String token) {
        String link = frontendBaseUrl + "/verify-email?token=" + token;
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color:#b45309;">Bienvenue sur L'Bled First, %s !</h2>
                    <p>Merci de confirmer votre adresse email pour activer votre compte :</p>
                    <p style="text-align:center; margin: 32px 0;">
                        <a href="%s" style="background:#b45309;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                            Confirmer mon email
                        </a>
                    </p>
                    <p style="color:#666;font-size:13px;">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
                </div>
                """.formatted(toName, link);

        send(toEmail, "Confirmez votre adresse email — L'Bled First", body);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String toName, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        String body = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color:#b45309;">Réinitialisation de mot de passe</h2>
                    <p>Bonjour %s,</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe L'Bled First :</p>
                    <p style="text-align:center; margin: 32px 0;">
                        <a href="%s" style="background:#b45309;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                            Réinitialiser mon mot de passe
                        </a>
                    </p>
                    <p style="color:#666;font-size:13px;">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe reste inchangé.</p>
                </div>
                """.formatted(toName, link);

        send(toEmail, "Réinitialisation de votre mot de passe — L'Bled First", body);
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException | RuntimeException e) {
            log.error("Échec de l'envoi de l'email à {} : {}", to, e.getMessage());
        }
    }
}
