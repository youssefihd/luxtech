package com.luxtech.booking.service;

import com.luxtech.booking.client.HebergementApiResponse;
import com.luxtech.booking.entity.Facture;
import com.luxtech.booking.entity.Reservation;
import com.luxtech.booking.entity.ReservationService;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class FacturePdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.FRENCH);

    // ── Facture liee a une reservation de chambre ─────────────
    public byte[] generer(Facture f, Reservation r, HebergementApiResponse.HebergementData h) {
        String html = buildHtml(f, r, h);
        return renderPdf(html);
    }

    // ── Facture liee a un service autonome (sans chambre) ─────
    public byte[] genererPourService(Facture f, ReservationService rs, HebergementApiResponse.HebergementData h) {
        String html = buildHtmlService(f, rs, h);
        return renderPdf(html);
    }

    private byte[] renderPdf(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            org.jsoup.nodes.Document jsoupDoc = Jsoup.parse(html);
            org.w3c.dom.Document w3cDoc = new W3CDom().fromJsoup(jsoupDoc);

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withW3cDocument(w3cDoc, "");
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF de la facture", e);
        }
    }

    // ── Champs communs identite hotel / legal (partages entre les deux types de facture) ──
    private void putHotelFields(Map<String, String> v, HebergementApiResponse.HebergementData h) {
        v.put("HOTEL_NOM", h != null ? escape(safe(h.getNom())) : "—");
        v.put("HOTEL_ADRESSE", h != null ? escape(safe(h.getAdresse())) : "—");
        v.put("HOTEL_VILLE", h != null ? escape(safe(h.getVille())) : "");
        v.put("HOTEL_TELEPHONE", h != null && h.getTelephone() != null ? escape(h.getTelephone()) : "—");
        v.put("HOTEL_LOGO_BLOCK", (h != null && h.getLogoUrl() != null && !h.getLogoUrl().isBlank())
                ? "<img src=\"" + escapeAttr(h.getLogoUrl()) + "\" class=\"logo-img\"/>"
                : "<div class=\"logo-fallback\">" + initiales(h != null ? h.getNom() : "H") + "</div>");
        v.put("LEGAL_LINE", buildLegalLine(h));
        v.put("HOTEL_EMAIL", h != null && h.getEmail() != null ? escape(h.getEmail()) : "—");
    }

    private void putTotauxFields(Map<String, String> v, Facture f, BigDecimal total, BigDecimal ht, BigDecimal tva) {
        v.put("MONTANT_HT", money(ht));
        v.put("MONTANT_TVA", money(tva));
        v.put("TAUX_TVA", f.getTauxTva() != null ? f.getTauxTva().stripTrailingZeros().toPlainString() : "10");
        v.put("MONTANT_TOTAL", money(total));
        v.put("MONTANT_LETTRES", capitalize(NumberToWordsFr.convert(total)) + " Dirhams");

        Facture.MethodePaiement methode = f.getMethodePaiement();
        v.put("CHECK_ESPECE", methode == Facture.MethodePaiement.ESPECE ? "check" : "");
        v.put("CHECK_CARTE", methode == Facture.MethodePaiement.CARTE ? "check" : "");
        v.put("CHECK_CHEQUE", methode == Facture.MethodePaiement.CHEQUE ? "check" : "");
        v.put("CHECK_VIREMENT", methode == Facture.MethodePaiement.VIREMENT ? "check" : "");
    }

    private String buildHtml(Facture f, Reservation r, HebergementApiResponse.HebergementData h) {
        BigDecimal total = nz(f.getMontantTotal());
        BigDecimal ht = nz(f.getMontantHt());
        BigDecimal tva = nz(f.getMontantTva());

        Map<String, String> v = new HashMap<>();
        putHotelFields(v, h);

        v.put("NUMERO_FACTURE", escape(f.getNumeroFacture()));
        v.put("CHAMBRE_LABEL", "Chambre N°");
        v.put("CHAMBRE", r != null && r.getChambreId() != null ? String.valueOf(r.getChambreId()) : "—");
        v.put("DATE_FACTURE", f.getDateFacture() != null ? DATE_FMT.format(f.getDateFacture()) : "—");
        v.put("CLIENT_NOM", r != null ? escape((safe(r.getClientNom()) + " " + safe(r.getClientPrenom())).trim()) : "—");
        v.put("CLIENT_CIN", r != null && r.getClientCinPasseport() != null ? escape(r.getClientCinPasseport()) : "—");
        v.put("CLIENT_NATIONALITE", r != null && r.getClientNationalite() != null ? escape(r.getClientNationalite()) : "—");
        v.put("DATE_ARRIVEE", r != null && r.getDateArrivee() != null ? DATE_FMT.format(r.getDateArrivee()) : "—");
        v.put("DATE_DEPART", r != null && r.getDateDepart() != null ? DATE_FMT.format(r.getDateDepart()) : "—");

        int nbNuits = r != null && r.getNbNuits() != null ? r.getNbNuits() : 1;
        BigDecimal prixNuit = r != null && r.getPrixChambreNuit() != null
                ? r.getPrixChambreNuit()
                : (nbNuits > 0 ? total.divide(BigDecimal.valueOf(nbNuits), 2, RoundingMode.HALF_UP) : total);
        v.put("COL3_LABEL", "Nbr Nuits");
        v.put("PRESTATION_LABEL", r != null && r.getChambreId() != null
                ? "Chambre (Ch. " + r.getChambreId() + ")" : "Séjour");
        v.put("NB_NUITS", String.valueOf(nbNuits));
        v.put("PRIX_UNIT", money(prixNuit));
        v.put("PRIX_LIGNE_TOTAL", money(total));

        putTotauxFields(v, f, total, ht, tva);

        String result = TEMPLATE;
        for (Map.Entry<String, String> entry : v.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    // ── Variante pour une facture de service autonome (sans chambre/sejour) ──
    private String buildHtmlService(Facture f, ReservationService rs, HebergementApiResponse.HebergementData h) {
        BigDecimal total = nz(f.getMontantTotal());
        BigDecimal ht = nz(f.getMontantHt());
        BigDecimal tva = nz(f.getMontantTva());

        Map<String, String> v = new HashMap<>();
        putHotelFields(v, h);

        v.put("NUMERO_FACTURE", escape(f.getNumeroFacture()));
        v.put("CHAMBRE_LABEL", "Prestation");
        v.put("CHAMBRE", rs != null ? escape(safe(rs.getServiceNom())) : "—");
        v.put("DATE_FACTURE", f.getDateFacture() != null ? DATE_FMT.format(f.getDateFacture()) : "—");
        v.put("CLIENT_NOM", rs != null ? escape(safe(rs.getClientNom())) : "—");
        v.put("CLIENT_CIN", "—");
        v.put("CLIENT_NATIONALITE", "—");
        String dateService = rs != null && rs.getServiceDate() != null ? DATE_FMT.format(rs.getServiceDate()) : "—";
        v.put("DATE_ARRIVEE", dateService);
        v.put("DATE_DEPART", dateService);

        int quantite = rs != null && rs.getQuantite() != null ? rs.getQuantite() : 1;
        BigDecimal prixUnit = rs != null && rs.getPrixUnitaire() != null ? rs.getPrixUnitaire() : total;
        v.put("COL3_LABEL", "Quantité");
        v.put("PRESTATION_LABEL", rs != null ? safe(rs.getServiceNom()) : "Service");
        v.put("NB_NUITS", String.valueOf(quantite));
        v.put("PRIX_UNIT", money(prixUnit));
        v.put("PRIX_LIGNE_TOTAL", money(total));

        putTotauxFields(v, f, total, ht, tva);

        String result = TEMPLATE;
        for (Map.Entry<String, String> entry : v.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    private String buildLegalLine(HebergementApiResponse.HebergementData h) {
        if (h == null) return "";
        StringBuilder sb = new StringBuilder();
        appendLegal(sb, "R.C", h.getRc());
        appendLegal(sb, "Patente", h.getPatente());
        appendLegal(sb, "I.F", h.getNumeroFiscal());
        appendLegal(sb, "C.N.S.S", h.getCnss());
        appendLegal(sb, "Code Postal", h.getCodePostal());
        appendLegal(sb, "ICE", h.getIce());
        return sb.toString();
    }

    private void appendLegal(StringBuilder sb, String label, String value) {
        if (value == null || value.isBlank()) return;
        if (sb.length() > 0) sb.append(" - ");
        sb.append(label).append(": ").append(escape(value));
    }

    private String initiales(String nom) {
        if (nom == null || nom.isBlank()) return "H";
        String[] parts = nom.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) sb.append(Character.toUpperCase(p.charAt(0)));
            if (sb.length() >= 2) break;
        }
        return sb.toString();
    }

    private static final String TEMPLATE = """
        <html>
        <head>
        <meta charset="UTF-8"/>
        <style>
            @page { size: A4; margin: 0; }
            body { font-family: Helvetica, Arial, sans-serif; margin: 0; color: #1e293b; font-size: 12px; }
            .frame { border: 3px solid #1D2252; margin: 14px; padding: 20px 24px; }

            .header { display: table; width: 100%; margin-bottom: 14px; }
            .header-left { display: table-cell; vertical-align: middle; width: 70%; }
            .header-right { display: table-cell; vertical-align: middle; width: 30%; text-align: right; }
            .logo-row { display: table; }
            .logo-cell { display: table-cell; vertical-align: middle; padding-right: 14px; }
            .logo-img { max-height: 60px; max-width: 90px; }
            .logo-fallback { width: 56px; height: 56px; border-radius: 10px; background-color: #1D2252;
                color: white; font-weight: bold; font-size: 18px; text-align: center; line-height: 56px; }
            .name-cell { display: table-cell; vertical-align: middle; }
            .hotel-name { font-size: 20px; font-weight: 900; color: #1D2252; margin: 0; }
            .hotel-addr { font-size: 10px; color: #475569; margin: 3px 0 0 0; }
            .hotel-tel { font-size: 10px; color: #475569; margin: 1px 0 0 0; }

            .divider { border-top: 2px solid #1D2252; margin: 10px 0 14px 0; }

            .infobox-row { display: table; width: 100%; margin-bottom: 14px; }
            .infobox { display: table-cell; border: 1.5px solid #1D2252; padding: 8px 12px; vertical-align: top; }
            .infobox + .infobox { border-left: none; }
            .infobox-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
            .infobox-value { font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; }

            table.prestations { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
            table.prestations th { background-color: #1D2252; color: white; font-size: 10px; text-transform: uppercase;
                padding: 8px 10px; text-align: left; }
            table.prestations th.right, table.prestations td.right { text-align: right; }
            table.prestations td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px; }
            table.prestations tr.empty td { height: 22px; }

            .bottom-row { display: table; width: 100%; }
            .bottom-left { display: table-cell; width: 58%; vertical-align: top; padding-right: 14px; }
            .bottom-right { display: table-cell; width: 42%; vertical-align: top; }

            .lettres-box { border: 1.5px solid #1D2252; padding: 10px 12px; margin-bottom: 12px; }
            .lettres-label { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .lettres-value { font-style: italic; font-weight: bold; font-size: 12px; color: #0f172a; }

            .encaissement-box { border: 1.5px solid #1D2252; padding: 10px 12px; }
            .encaissement-title { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
            table.encaiss { width: 100%; border-collapse: collapse; }
            table.encaiss td { font-size: 11px; padding: 3px 0; }
            .box { display: inline-block; width: 11px; height: 11px; border: 1.5px solid #1D2252; text-align: center;
                line-height: 10px; font-size: 9px; font-weight: 900; margin-right: 6px; }

            table.totaux { width: 100%; border-collapse: collapse; }
            table.totaux td { padding: 7px 10px; font-size: 11px; border: 1px solid #cbd5e1; }
            table.totaux td.label { background-color: #f1f5f9; font-weight: bold; }
            table.totaux td.value { text-align: right; }
            table.totaux tr.net td { background-color: #1D2252; color: white; font-weight: 900; font-size: 13px; }

            .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #cbd5e1;
                font-size: 8.5px; color: #64748b; text-align: center; }
        </style>
        </head>
        <body>
            <div class="frame">

                <div class="header">
                    <div class="header-left">
                        <div class="logo-row">
                            <div class="logo-cell">{{HOTEL_LOGO_BLOCK}}</div>
                            <div class="name-cell">
                                <p class="hotel-name">{{HOTEL_NOM}}</p>
                                <p class="hotel-addr">{{HOTEL_ADRESSE}}{{HOTEL_VILLE}}</p>
                                <p class="hotel-tel">Tél: {{HOTEL_TELEPHONE}}</p>
                            </div>
                        </div>
                    </div>
                    <div class="header-right">
                        <p class="hotel-tel">Email: {{HOTEL_EMAIL}}</p>
                    </div>
                </div>
                <div class="divider"></div>

                <div class="infobox-row">
                    <div class="infobox">
                        <div class="infobox-label">Facture N°</div>
                        <div class="infobox-value">{{NUMERO_FACTURE}}</div>
                        <div class="infobox-label" style="margin-top:6px;">{{CHAMBRE_LABEL}}</div>
                        <div class="infobox-value">{{CHAMBRE}}</div>
                    </div>
                    <div class="infobox">
                        <div class="infobox-label">Date</div>
                        <div class="infobox-value">{{DATE_FACTURE}}</div>
                        <div class="infobox-label" style="margin-top:6px;">Destinataire</div>
                        <div class="infobox-value">{{CLIENT_NOM}}</div>
                        <div style="font-size:9px;color:#64748b;margin-top:2px;">CIN/Passeport: {{CLIENT_CIN}} | Nat: {{CLIENT_NATIONALITE}}</div>
                    </div>
                    <div class="infobox">
                        <div class="infobox-label">Séjour du</div>
                        <div class="infobox-value">{{DATE_ARRIVEE}}</div>
                        <div class="infobox-label" style="margin-top:6px;">Au</div>
                        <div class="infobox-value">{{DATE_DEPART}}</div>
                    </div>
                </div>

                <table class="prestations">
                    <thead>
                        <tr>
                            <th>Prestations</th>
                            <th class="right">Prix Unit.</th>
                            <th class="right">{{COL3_LABEL}}</th>
                            <th class="right">Prix Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{PRESTATION_LABEL}}</td>
                            <td class="right">{{PRIX_UNIT}}</td>
                            <td class="right">{{NB_NUITS}}</td>
                            <td class="right">{{PRIX_LIGNE_TOTAL}}</td>
                        </tr>
                        <tr class="empty"><td colspan="4"></td></tr>
                        <tr class="empty"><td colspan="4"></td></tr>
                    </tbody>
                </table>

                <div class="bottom-row">
                    <div class="bottom-left">
                        <div class="lettres-box">
                            <div class="lettres-label">Arrêtée la présente facture à la somme de</div>
                            <div class="lettres-value">{{MONTANT_LETTRES}}</div>
                        </div>
                        <div class="encaissement-box">
                            <div class="encaissement-title">Encaissement</div>
                            <table class="encaiss">
                                <tr>
                                    <td width="50%"><span class="box">{{CHECK_ESPECE}}</span>Espèce</td>
                                    <td width="50%"><span class="box">{{CHECK_CARTE}}</span>Carte / Crédit</td>
                                </tr>
                                <tr>
                                    <td><span class="box">{{CHECK_CHEQUE}}</span>Chèque</td>
                                    <td><span class="box">{{CHECK_VIREMENT}}</span>Virement bancaire</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="bottom-right">
                        <table class="totaux">
                            <tr><td class="label">Total à Payer H.T</td><td class="value">{{MONTANT_HT}}</td></tr>
                            <tr><td class="label">T.V.A ({{TAUX_TVA}}%)</td><td class="value">{{MONTANT_TVA}}</td></tr>
                            <tr class="net"><td>Net à Payer TTC</td><td class="value">{{MONTANT_TOTAL}}</td></tr>
                        </table>
                    </div>
                </div>

                <div class="footer">{{LEGAL_LINE}}</div>
            </div>
        </body>
        </html>
        """;

    private BigDecimal nz(BigDecimal val) { return val != null ? val : BigDecimal.ZERO; }
    private String safe(String val) { return val != null ? val : ""; }

    private String money(BigDecimal val) {
        return String.format(Locale.FRANCE, "%,.2f DH", val);
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private String escapeAttr(String s) {
        return escape(s).replace("\"", "&quot;");
    }

    private String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private static final class NumberToWordsFr {
        private static final String[] UNITES = {
                "", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
                "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
                "dix-sept", "dix-huit", "dix-neuf"
        };
        private static final String[] DIZAINES = {
                "", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"
        };

        static String convert(BigDecimal amount) {
            BigDecimal rounded = amount.setScale(2, RoundingMode.HALF_UP);
            long entier = rounded.longValue();
            int centimes = rounded.remainder(BigDecimal.ONE).movePointRight(2).abs().intValue();

            String result = convertInt(entier);
            if (centimes > 0) {
                result += " et " + convertInt(centimes) + " centime" + (centimes > 1 ? "s" : "");
            }
            return result;
        }

        private static String convertInt(long n) {
            if (n == 0) return "zéro";
            if (n < 0) return "moins " + convertInt(-n);

            StringBuilder sb = new StringBuilder();
            long milliards = n / 1_000_000_000L; n %= 1_000_000_000L;
            long millions   = n / 1_000_000L;     n %= 1_000_000L;
            long milliers    = n / 1_000L;         n %= 1_000L;
            long reste       = n;

            if (milliards > 0) {
                sb.append(convertGroupe(milliards)).append(milliards > 1 ? " milliards " : " milliard ");
            }
            if (millions > 0) {
                sb.append(convertGroupe(millions)).append(millions > 1 ? " millions " : " million ");
            }
            if (milliers > 0) {
                if (milliers == 1) sb.append("mille ");
                else sb.append(convertGroupe(milliers)).append(" mille ");
            }
            if (reste > 0) {
                sb.append(convertGroupe(reste));
            }
            return sb.toString().trim().replaceAll("\\s+", " ");
        }

        private static String convertGroupe(long n) {
            StringBuilder sb = new StringBuilder();
            long centaines = n / 100; long reste = n % 100;

            if (centaines > 0) {
                if (centaines == 1) sb.append("cent");
                else sb.append(UNITES[(int) centaines]).append(" cent");
                if (reste == 0 && centaines > 1) sb.append("s");
                sb.append(" ");
            }

            if (reste > 0) {
                sb.append(convertDizaine(reste));
            }
            return sb.toString().trim();
        }

        private static String convertDizaine(long n) {
            if (n < 20) return UNITES[(int) n];

            int d = (int) (n / 10);
            int u = (int) (n % 10);

            if (d == 7 || d == 9) {
                int base = d == 7 ? 60 : 80;
                String prefix = d == 7 ? "soixante" : "quatre-vingt";
                int reste = (int) n - base;
                String liaison = (reste == 1 && d == 7) ? " et " : "-";
                return prefix + liaison + UNITES[10 + reste];
            }

            String dizaineStr = DIZAINES[d];
            if (u == 0) {
                if (d == 8) return dizaineStr + "s";
                return dizaineStr;
            }
            if (u == 1 && d != 8) {
                return dizaineStr + " et un";
            }
            return dizaineStr + "-" + UNITES[u];
        }
    }
}