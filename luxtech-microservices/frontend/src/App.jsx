import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Iso8583PaymentPage from './pages/Iso8583PaymentPage'
// ── Public pages ──────────────────────────────────────────
import HomePage from './pages/public/HomePage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CompleteProfile from './pages/auth/CompleteProfile'

// ── Pages vitrine ─────────────────────────────────────────
import AboutPage from './pages/public/AboutPage'
import SolutionsPage from './pages/public/SolutionsPage'
import TarifsPage from './pages/public/TarifsPage'
import ContactPage from './pages/public/ContactPage'
import DocumentationPage from './pages/public/DocumentationPage'
import BlogPostPage from './pages/public/BlogPostPage'

// ── Layouts ───────────────────────────────────────────────
import Layout from './components/layout/Layout'
import HebergementLayout from './components/layout/HebergementLayout'

// ── Admin ─────────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminHebergements from './pages/admin/AdminHebergements'
import AdminAgences from './pages/admin/AdminAgences'
import AdminProfile from './pages/admin/AdminProfile'
import AdminRapports from './pages/admin/AdminRapports'
import AdminAlertes from './pages/admin/AdminAlertes'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminMessagerie from './pages/admin/AdminMessagerie'
import AdminSecurite from './pages/admin/AdminSecurite'
import AdminParametres from './pages/admin/AdminParametres'
import AdminReservations from './pages/admin/AdminReservations'
import AdminPaiements from './pages/admin/AdminPaiements'
import AdminCommissions from './pages/admin/AdminCommissions'
import AdminReversements from './pages/admin/AdminReversements'
import AdminFactures from './pages/admin/AdminFactures'
import AdminBookingEngine from './pages/admin/AdminBookingEngine'
import AdminDistribution from './pages/admin/AdminDistribution'

// ── Hebergement ───────────────────────────────────────────
import HebergementDashboard from './pages/hebergement/HebergementDashboard'
import HebergementProfile from './pages/hebergement/HebergementProfile'
import HebergementChambres from './pages/hebergement/HebergementChambres'
import HebergementTypesChambres from './pages/hebergement/HebergementTypesChambres'
import HebergementReservations from './pages/hebergement/HebergementReservations'
import HebergementCalendrier from './pages/hebergement/HebergementCalendrier'
import HebergementFactures from './pages/hebergement/HebergementFactures'
import HebergementPMS from './pages/hebergement/HebergementPMS'
import HebergementServices from './pages/hebergement/HebergementServices'
import HebergementReservationsServices from './pages/hebergement/HebergementReservationsServices'
import HebergementTarifsSaisonniers from './pages/hebergement/HebergementTarifsSaisonniers'
import HebergementClients from './pages/hebergement/HebergementClients'
import HebergementMessages from './pages/hebergement/HebergementMessages'
import HebergementPaiements from './pages/hebergement/HebergementPaiements'
import HebergementBookingEngine from './pages/hebergement/HebergementBookingEngine'
import BookingEnginePublic from './pages/public/BookingEnginePublic'
import HebergementNotifications from './pages/hebergement/HebergementNotifications'
import HebergementSubscriptions from './pages/hebergement/HebergementSubscriptions'
import HebergementActivityLogs from './pages/hebergement/HebergementActivityLogs'
import HebergementInfo from './pages/hebergement/HebergementInfo'
import HebergementEmployees from './pages/hebergement/HebergementEmployees'

// ── Agence ────────────────────────────────────────────────
import AgencyDashboard from './pages/agency/AgencyDashboard'
import AgencyReservations from './pages/agency/AgencyReservations'
import AgencyProfile from './pages/agency/AgencyProfile'
import AgencyClients from './pages/agency/AgencyClients'
import AgencySearch from './pages/agency/AgencySearch'
import AgencyInvoices from './pages/agency/AgencyInvoices'

// ── Page placeholder ──────────────────────────────────────
const ComingSoon = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6"
             style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm max-w-sm">Ce module est en cours de developpement. Il sera disponible dans une prochaine version de LuxTech.</p>
        <div className="mt-6 px-4 py-2 rounded-full text-xs font-bold text-white"
             style={{ background: 'linear-gradient(135deg, #66CAD8, #5D2E8B)' }}>
            Bientot disponible
        </div>
    </div>
)

// ─── Guards ───────────────────────────────────────────────
function PrivateRoute({ children, roles }) {
    const { user, token } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />
    return children
}

function DashboardRedirect() {
    const { user, token } = useAuth()
    if (!token) return <Navigate to="/login" replace />
    if (user?.role === 'CLIENT') return <Navigate to="/admin" replace />
    if (user?.role === 'HEBERGEMENT_ADMIN' || user?.role === 'HEBERGEMENT_STAFF') return <Navigate to="/hotel" replace />
    if (user?.role === 'AGENCY_ADMIN' || user?.role === 'AGENCY_STAFF') return <Navigate to="/agence" replace />
    return <Navigate to="/login" replace />
}

function HomeWrapper() {
    const navigate = useNavigate()
    return <HomePage onLoginClick={() => navigate('/login')} onRegisterClick={() => navigate('/register')} />
}

function VitrineWrapper({ Page }) {
    const navigate = useNavigate()
    if (!Page) return <Navigate to="/" replace />
    return <Page onLoginClick={() => navigate('/login')} onRegisterClick={() => navigate('/register')} />
}

export default function App() {
    return (
        <Routes>
            {/* ══ PAGES PUBLIQUES ══════════════════════════════ */}
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
<Route
    path="/iso8583"
    element={<VitrineWrapper Page={Iso8583PaymentPage} />}
/>
            {/* ══ PAGES VITRINE ════════════════════════════════ */}
            <Route path="/about" element={<VitrineWrapper Page={AboutPage} />} />
            <Route path="/solutions" element={<VitrineWrapper Page={SolutionsPage} />} />
            <Route path="/pricing" element={<VitrineWrapper Page={TarifsPage} />} />
            <Route path="/contact" element={<VitrineWrapper Page={ContactPage} />} />
            <Route path="/documentation" element={<VitrineWrapper Page={DocumentationPage} />} />
            <Route path="/blog" element={<VitrineWrapper Page={BlogPostPage} />} />
            <Route path="/BlogPost" element={<VitrineWrapper Page={BlogPostPage} />} />

            {/* ══ BOOKING ENGINE PUBLIC ════════════════════════ */}
            <Route path="/reserver/:slug" element={<BookingEnginePublic />} />

            {/* ══ ADMIN ════════════════════════════════════════ */}
            <Route path="/admin" element={
                <PrivateRoute roles={['CLIENT']}><Layout /></PrivateRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                {/* Hebergements */}
                <Route path="hotels" element={<AdminHebergements />} />
                <Route path="hebergements/:type" element={<AdminHebergements />} />
                {/* Agences */}
                <Route path="agences" element={<AdminAgences />} />
                <Route path="agences/:type" element={<AdminAgences />} />
                {/* Reservations & Paiements */}
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="paiements" element={<AdminPaiements />} />
                <Route path="commissions" element={<AdminCommissions />} />
                <Route path="reversements" element={<AdminReversements />} />
                <Route path="factures" element={<AdminFactures />} />                {/* Distribution */}
                <Route path="channel-manager" element={<ComingSoon title="Channel Manager" />} />
                <Route path="booking-engine" element={<AdminBookingEngine />} />
                <Route path="distribution" element={<AdminDistribution />} />                {/* Analytique */}
                <Route path="rapports" element={<AdminRapports />} />
                <Route path="alertes" element={<AdminAlertes />} />
                {/* Configuration */}
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="messagerie" element={<AdminMessagerie />} />
                <Route path="securite" element={<AdminSecurite />} />
                <Route path="parametres" element={<AdminParametres />} />
                <Route path="profil" element={<AdminProfile />} />
            </Route>

            {/* ══ HEBERGEMENT ══════════════════════════════════ */}
            <Route path="/hotel" element={
                <PrivateRoute roles={['HEBERGEMENT_ADMIN', 'CLIENT']}>
                    <HebergementLayout />
                </PrivateRoute>
            }>
                <Route index element={<HebergementDashboard />} />
                {/* Reservations */}
                <Route path="reservations" element={<HebergementReservations />} />
                <Route path="calendrier" element={<HebergementCalendrier />} />
                {/* Chambres */}
                <Route path="chambres" element={<HebergementChambres />} />
                <Route path="roomstype" element={<HebergementTypesChambres />} />
                <Route path="services" element={<HebergementServices />} />
                <Route path="services-reservations" element={<HebergementReservationsServices />} />
                {/* Clients */}
                <Route path="clients" element={<HebergementClients />} />
                <Route path="messages" element={<HebergementMessages />} />
                {/* Finance */}
                <Route path="paiements" element={<HebergementPaiements />} />
                <Route path="factures" element={<HebergementFactures />} />
                <Route path="tarifs-saisonniers" element={<HebergementTarifsSaisonniers />} />
                <Route path="reversements" element={<ComingSoon title="Reversements" />} />
                {/* Canaux */}
                <Route path="booking-engine" element={<HebergementBookingEngine />} />
                <Route path="channel-manager" element={<ComingSoon title="Channel Manager" />} />
                {/* Operations */}
                <Route path="notifications" element={<HebergementNotifications />} />
                <Route path="employees" element={<HebergementEmployees />} />                <Route path="subscriptions" element={<HebergementSubscriptions />} />
                <Route path="activity-logs" element={<HebergementActivityLogs />} />
                <Route path="info" element={<HebergementInfo />} />                {/* Autres */}
                <Route path="profil" element={<HebergementProfile />} />
                <Route path="disponibilites" element={<ComingSoon title="Disponibilites" />} />
                <Route path="tarifs" element={<ComingSoon title="Tarifs et Promotions" />} />
                <Route path="rapports" element={<ComingSoon title="Rapports" />} />
                <Route path="pms" element={<HebergementPMS />} />
            </Route>

            {/* ══ AGENCE ═══════════════════════════════════════ */}
            <Route path="/agence" element={
                <PrivateRoute roles={['AGENCY_ADMIN', 'AGENCY_STAFF']}><Layout /></PrivateRoute>
            }>
                <Route index element={<AgencyDashboard />} />
                <Route path="reservations" element={<AgencyReservations />} />
                <Route path="profil" element={<AgencyProfile />} />
                <Route path="recherche" element={<AgencySearch />} />
                <Route path="clients" element={<AgencyClients />} />
                <Route path="factures" element={<AgencyInvoices />} />
                <Route path="commissions" element={<ComingSoon title="Commissions" />} />
                <Route path="paiements" element={<ComingSoon title="Paiements" />} />
                <Route path="rapports" element={<ComingSoon title="Rapports" />} />
                <Route path="messagerie" element={<ComingSoon title="Messagerie" />} />
                <Route path="notifications" element={<ComingSoon title="Notifications" />} />
            </Route>

            {/* ══ 404 ══════════════════════════════════════════ */}
            <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
    )
}
