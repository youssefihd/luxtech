import { useState, useEffect } from 'react'
import {
    CreditCard,
    ShieldCheck,
    Server,
    Activity,
    ArrowRight,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Terminal,
    Database,
    Network,
    Clock,
    Receipt,
    Lock,
    Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from './public/components/Navbar'
import FooterSection from './public/components/FooterSection'

const CURRENCIES = [
    { code: '504', label: 'MAD - Moroccan Dirham', symbol: 'MAD' },
    { code: '840', label: 'USD - US Dollar', symbol: '$' },
    { code: '978', label: 'EUR - Euro', symbol: '€' },
    { code: '826', label: 'GBP - British Pound', symbol: '£' },
]

function detectCardType(pan) {
    if (!pan) return null
    if (/^4/.test(pan)) return 'VISA'
    if (/^5[1-5]/.test(pan) || /^2[2-7]/.test(pan)) return 'MASTERCARD'
    if (/^3[47]/.test(pan)) return 'AMEX'
    if (/^6(?:011|5)/.test(pan)) return 'DISCOVER'
    return null
}

const CARD_COLORS = {
    VISA: '#1a1f71',
    MASTERCARD: '#eb001b',
    AMEX: '#006fcf',
    DISCOVER: '#ff6000',
}

const Iso8583PaymentPage = ({ onLoginClick, onRegisterClick }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [form, setForm] = useState({
        cardNumber: '4111111111111111',
        expiryDate: '2712',
        amount: '49.99',
        currencyCode: '504',
        terminalId: 'TERM0001',
        merchantId: 'MERCHANT000001',
    })

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [history, setHistory] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        setIsVisible(true)
    }, [])

    const cardType = detectCardType(form.cardNumber)

    const currencySymbol =
        CURRENCIES.find(c => c.code === form.currencyCode)?.symbol || ''

    const update = (field) => (e) => {
        setForm(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }

    const submit = async (endpoint) => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const res = await fetch(`/api/payments/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardNumber: form.cardNumber,
                    expiryDate: form.expiryDate,
                    amount: parseFloat(form.amount),
                    currencyCode: form.currencyCode,
                    terminalId: form.terminalId,
                    merchantId: form.merchantId,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Request failed')
                return
            }

            setResult(data)

            setHistory(prev => [
                {
                    ...data,
                    type: endpoint.toUpperCase(),
                    time: new Date().toLocaleTimeString(),
                },
                ...prev,
            ].slice(0, 20))

        } catch (err) {
            setError(
                err.message ||
                'Network error. Is the backend running?'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

            <Navbar
                onLoginClick={onLoginClick}
                onRegisterClick={onRegisterClick}
            />

            {/* HERO */}
            <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-24 bg-gradient-to-br from-[#0F1A2F] via-[#1A237E] to-[#0F172A] overflow-hidden">

                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-[#00BCD4] rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#5E35B1] rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div
                        className={`text-center transform transition-all duration-1000 ${
                            isVisible
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-10 opacity-0'
                        }`}
                    >

                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
                            <div className="w-2 h-2 bg-[#00BCD4] rounded-full animate-pulse" />

                            <span className="text-white text-sm font-medium">
                                Payment Infrastructure
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            ISO 8583{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BCD4] to-[#5E35B1]">
                                Payment Gateway
                            </span>
                        </h1>

                        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Testez les transactions de paiement ISO 8583
                            directement depuis l'interface LuxTech.
                        </p>

                        <div className="flex justify-center gap-4 mt-8 flex-wrap">

                            <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-blue-100">
                                <Network size={18} />
                                <span className="text-sm">ISO 8583:1987</span>
                            </div>

                            <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-blue-100">
                                <Server size={18} />
                                <span className="text-sm">Spring Boot</span>
                            </div>

                            <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-blue-100">
                                <ShieldCheck size={18} />
                                <span className="text-sm">Secure Processing</span>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* PAYMENT TERMINAL */}
            <section className="py-12 lg:py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* LEFT: PAYMENT FORM */}
                        <div className="lg:col-span-3">

                            <div
                                className={`bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 transform transition-all duration-1000 ${
                                    isVisible
                                        ? 'translate-x-0 opacity-100'
                                        : '-translate-x-10 opacity-0'
                                }`}
                            >

                                <div className="flex items-center justify-between mb-8">

                                    <div className="flex items-center gap-3">

                                        <div className="w-12 h-12 bg-gradient-to-r from-[#1A237E] to-[#5E35B1] rounded-xl flex items-center justify-center">
                                            <CreditCard
                                                size={24}
                                                className="text-white"
                                            />
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                Payment Terminal
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                ISO 8583 transaction simulator
                                            </p>
                                        </div>

                                    </div>

                                    {cardType && (
                                        <span
                                            className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                                            style={{
                                                background:
                                                    CARD_COLORS[cardType] ||
                                                    '#334155'
                                            }}
                                        >
                                            {cardType}
                                        </span>
                                    )}

                                </div>

                                {/* CARD NUMBER */}
                                <div className="mb-5">

                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                        Card Number (PAN - DE2)
                                    </label>

                                    <div className="relative">

                                        <CreditCard
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            value={form.cardNumber}
                                            onChange={update('cardNumber')}
                                            placeholder="4111 1111 1111 1111"
                                            maxLength={19}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition"
                                        />

                                    </div>

                                </div>

                                {/* EXPIRY + AMOUNT */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            Expiry YYMM (DE14)
                                        </label>

                                        <input
                                            value={form.expiryDate}
                                            onChange={update('expiryDate')}
                                            placeholder="2712"
                                            maxLength={4}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            Amount (DE4)
                                        </label>

                                        <input
                                            value={form.amount}
                                            onChange={update('amount')}
                                            placeholder="49.99"
                                            type="number"
                                            step="0.01"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                                        />
                                    </div>

                                </div>

                                {/* CURRENCY */}
                                <div className="mb-5">

                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                        Currency (DE49)
                                    </label>

                                    <select
                                        value={form.currencyCode}
                                        onChange={update('currencyCode')}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                                    >
                                        {CURRENCIES.map(currency => (
                                            <option
                                                key={currency.code}
                                                value={currency.code}
                                            >
                                                {currency.label}
                                            </option>
                                        ))}
                                    </select>

                                </div>

                                {/* TERMINAL + MERCHANT */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            Terminal ID (DE41)
                                        </label>

                                        <input
                                            value={form.terminalId}
                                            onChange={update('terminalId')}
                                            maxLength={8}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                            Merchant ID (DE42)
                                        </label>

                                        <input
                                            value={form.merchantId}
                                            onChange={update('merchantId')}
                                            maxLength={15}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#00BCD4]"
                                        />
                                    </div>

                                </div>

                                {/* BUTTONS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <button
                                        onClick={() => submit('purchase')}
                                        disabled={loading}
                                        className="group bg-gradient-to-r from-[#1A237E] to-[#5E35B1] text-white py-4 rounded-xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Zap size={20} />

                                        {loading
                                            ? 'Processing...'
                                            : `Purchase ${currencySymbol}${form.amount}`
                                        }

                                        {!loading && (
                                            <ArrowRight
                                                size={18}
                                                className="group-hover:translate-x-1 transition-transform"
                                            />
                                        )}

                                    </button>

                                    <button
                                        onClick={() => submit('authorize')}
                                        disabled={loading}
                                        className="border-2 border-[#1A237E] text-[#1A237E] py-4 rounded-xl font-bold hover:bg-[#1A237E] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <ShieldCheck size={20} />
                                        Auth Only
                                    </button>

                                </div>

                            </div>

                            {/* RESULT */}
                            {result && (
                                <div
                                    className={`mt-6 rounded-2xl p-6 border ${
                                        result.approved
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >

                                    <div className="flex items-center gap-3 mb-5">

                                        {result.approved ? (
                                            <CheckCircle2
                                                size={28}
                                                className="text-emerald-600"
                                            />
                                        ) : (
                                            <XCircle
                                                size={28}
                                                className="text-red-600"
                                            />
                                        )}

                                        <div>
                                            <h3
                                                className={`text-xl font-bold ${
                                                    result.approved
                                                        ? 'text-emerald-800'
                                                        : 'text-red-800'
                                                }`}
                                            >
                                                {result.approved
                                                    ? 'APPROVED'
                                                    : 'DECLINED'
                                                }
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                Transaction processed successfully
                                            </p>
                                        </div>

                                    </div>

                                    <div className="space-y-2 font-mono text-sm">

                                        <ResultRow
                                            label="Response Code (DE39)"
                                            value={`${result.responseCode} - ${result.responseMessage}`}
                                        />

                                        {result.authorizationCode && (
                                            <ResultRow
                                                label="Auth Code (DE38)"
                                                value={result.authorizationCode}
                                            />
                                        )}

                                        <ResultRow
                                            label="RRN (DE37)"
                                            value={result.retrievalReferenceNumber}
                                        />

                                        <ResultRow
                                            label="Masked PAN"
                                            value={result.maskedPan}
                                        />

                                        <ResultRow
                                            label="Transaction ID"
                                            value={result.transactionId}
                                        />

                                    </div>

                                </div>
                            )}

                            {/* ERROR */}
                            {error && (
                                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">

                                    <div className="flex items-center gap-3">

                                        <AlertTriangle
                                            size={22}
                                            className="text-amber-600"
                                        />

                                        <div>
                                            <h3 className="font-bold text-amber-800">
                                                Payment Error
                                            </h3>

                                            <p className="text-sm text-amber-700 mt-1">
                                                {error}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>

                        {/* RIGHT SIDE */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* STATUS */}
                            <div className="bg-gradient-to-br from-[#1A237E] to-[#5E35B1] rounded-3xl p-6 text-white shadow-xl">

                                <div className="flex items-center gap-3 mb-5">
                                    <Activity
                                        size={24}
                                        className="text-[#00BCD4]"
                                    />

                                    <h3 className="text-xl font-bold">
                                        Gateway Status
                                    </h3>
                                </div>

                                <div className="space-y-4">

                                    <StatusItem
                                        icon={Server}
                                        label="Payment API"
                                        status="Online"
                                    />

                                    <StatusItem
                                        icon={Network}
                                        label="ISO 8583 Adapter"
                                        status="Connected"
                                    />

                                    <StatusItem
                                        icon={Database}
                                        label="Processor"
                                        status="Ready"
                                    />

                                </div>

                            </div>

                            {/* HISTORY */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">

                                <div className="flex items-center gap-3 mb-5">

                                    <Receipt
                                        size={22}
                                        className="text-[#1A237E]"
                                    />

                                    <h3 className="text-xl font-bold text-gray-900">
                                        Transaction History
                                    </h3>

                                </div>

                                {history.length === 0 ? (

                                    <div className="text-center py-8 text-gray-400">

                                        <Clock
                                            size={32}
                                            className="mx-auto mb-3 opacity-50"
                                        />

                                        <p className="text-sm">
                                            No transactions yet.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="space-y-2">

                                        {history.map((tx, index) => (

                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                            >

                                                <div className="min-w-0">

                                                    <div className="flex items-center gap-2">

                                                        <span className="font-bold text-xs text-gray-800">
                                                            {tx.type}
                                                        </span>

                                                        <span className="text-xs text-gray-400">
                                                            {tx.time}
                                                        </span>

                                                    </div>

                                                    <p className="text-xs font-mono text-gray-500 mt-1 truncate">
                                                        {tx.maskedPan}
                                                    </p>

                                                </div>

                                                <span
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                        tx.approved
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {tx.approved
                                                        ? 'OK'
                                                        : tx.responseCode
                                                    }
                                                </span>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* MESSAGE FLOW */}
            <section className="py-12 lg:py-16 bg-gradient-to-r from-gray-50 to-blue-50">

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="text-center mb-12">

                        <div className="inline-flex items-center gap-2 bg-[#1A237E]/10 px-4 py-2 rounded-full mb-4">
                            <Network
                                size={18}
                                className="text-[#1A237E]"
                            />

                            <span className="text-[#1A237E] text-sm font-semibold">
                                Transaction Architecture
                            </span>
                        </div>

                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                            ISO 8583{' '}
                            <span className="text-[#1A237E]">
                                Message Flow
                            </span>
                        </h2>

                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                            Visualisation du parcours d'une transaction depuis
                            l'interface jusqu'au processeur de paiement.
                        </p>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

                        <FlowCard
                            icon={Terminal}
                            title="React"
                            description="Payment UI"
                        />

                        <FlowArrow />

                        <FlowCard
                            icon={Server}
                            title="Spring Boot"
                            description="Payment Service"
                        />

                        <FlowArrow />

                        <FlowCard
                            icon={Network}
                            title="ISO 8583"
                            description="TCP/IP Adapter"
                        />

                    </div>

                    <div className="mt-8 bg-[#0F172A] rounded-2xl p-6 overflow-x-auto">

                        <div className="text-[#00BCD4] font-mono text-sm whitespace-pre">
{`React UI
   │
   │ POST /api/payments/purchase
   ▼
PaymentController
   │
   ▼
PaymentService
   │
   ▼
Iso8583PaymentProcessor
   │
   ▼
Iso8583Adapter
   │
   │ ISO 8583 over TCP/IP
   ▼
MockProcessorServer :9876
   │
   │ 0210 Response
   ▼
DE39 = 00  →  APPROVED`}
                        </div>

                    </div>

                </div>

            </section>

            {/* TEST CARDS */}
            <section className="py-12">

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="w-12 h-12 bg-gradient-to-r from-[#00BCD4] to-[#5E35B1] rounded-xl flex items-center justify-center">
                                <Lock
                                    size={24}
                                    className="text-white"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Test Cards
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Cards available for local testing
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <TestCard
                                number="4111111111111111"
                                result="Approved"
                                success
                            />

                            <TestCard
                                number="4111111111110000"
                                result="Insufficient funds"
                            />

                            <TestCard
                                number="4111111111119999"
                                result="Expired card"
                            />

                            <TestCard
                                number="4111111111114343"
                                result="Stolen card"
                            />

                        </div>

                        <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">

                            <AlertTriangle
                                size={20}
                                className="text-amber-600 shrink-0"
                            />

                            <span className="text-sm text-amber-800">
                                Amounts greater than 100,000 exceed the
                                configured transaction limit.
                            </span>

                        </div>

                    </div>

                </div>

            </section>

            <FooterSection />

        </div>
    )
}

/* -----------------------------------------------------------
   Small reusable components
----------------------------------------------------------- */

const ResultRow = ({ label, value }) => (
    <div className="flex justify-between gap-4 py-2 border-b border-black/5 last:border-0">
        <span className="text-gray-500">
            {label}
        </span>

        <span className="text-gray-900 text-right">
            {value}
        </span>
    </div>
)

const StatusItem = ({ icon: Icon, label, status }) => (
    <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Icon size={18} />
            </div>

            <span className="text-sm text-blue-100">
                {label}
            </span>

        </div>

        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {status}
        </span>

    </div>
)

const FlowCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 text-center hover:-translate-y-1 transition-all duration-300">

        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-[#1A237E] to-[#5E35B1] flex items-center justify-center">
            <Icon
                size={23}
                className="text-white"
            />
        </div>

        <h3 className="font-bold text-gray-900">
            {title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
            {description}
        </p>

    </div>
)

const FlowArrow = () => (
    <div className="hidden md:flex justify-center">
        <ArrowRight
            size={24}
            className="text-[#00BCD4]"
        />
    </div>
)

const TestCard = ({ number, result, success }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">

        <div className="flex items-center gap-3">

            <CreditCard
                size={20}
                className="text-[#1A237E]"
            />

            <code className="font-mono text-sm text-gray-700">
                {number}
            </code>

        </div>

        <span
            className={`text-xs font-bold ${
                success
                    ? 'text-emerald-600'
                    : 'text-red-500'
            }`}
        >
            {result}
        </span>

    </div>
)

export default Iso8583PaymentPage