import { useState } from 'react'
import { useForm, type UseFormRegister, type UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi, getErrorMessage } from '../api'
import { BLOOD_TYPES } from '../utils/constants'
import { isAgeEligible } from '../utils/eligibility'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Select } from '../components/Select'
import { Stepper, WizardNav } from '../components/Stepper'

const base = { email: z.string().email('Enter a valid email.'), phoneNum: z.string().min(7, 'Enter a valid phone number.'), username: z.string().min(3, 'Username must be at least 3 characters.'), password: z.string().min(8, 'Use at least 8 characters.') }
const passwordRule = (value: string) => value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
const donorSchema = z.object({ f_Name: z.string().min(1, 'Enter your first name.'), l_Name: z.string().min(1, 'Enter your last name.'), nic: z.string().regex(/^(\d{9}[VvXx]|\d{12})$/, 'Use a valid Sri Lankan NIC.'), dob: z.string().refine(isAgeEligible, `Donors must be between 18 and 60.`), bloodType: z.string().min(1, 'Choose your blood type.'), ...base, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' }).refine((data) => passwordRule(data.password), { path: ['password'], message: 'Use uppercase, lowercase, and a number.' })
const donorAccountSchema = z.object({ email: base.email, username: base.username, password: base.password, confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' }).refine((data) => passwordRule(data.password), { path: ['password'], message: 'Use uppercase, lowercase, and a number.' })
const donorPersonalSchema = z.object({ f_Name: z.string().min(1, 'Enter your first name.'), l_Name: z.string().min(1, 'Enter your last name.'), nic: z.string().regex(/^(\d{9}[VvXx]|\d{12})$/, 'Use a valid Sri Lankan NIC.'), dob: z.string().refine(isAgeEligible, 'Donors must be between 18 and 60.'), phoneNum: base.phoneNum })
const hostSchema = z.object({ orgName: z.string().min(1, 'Enter the organization name.'), ...base })
const hospitalSchema = z.object({ hospitalName: z.string().min(1, 'Enter the hospital name.'), address: z.string().min(1, 'Enter the address.'), ...base })
type DonorValues = z.infer<typeof donorSchema>; type HostValues = z.infer<typeof hostSchema>; type HospitalValues = z.infer<typeof hospitalSchema>; type Variant = 'donor' | 'host' | 'hospital'

const DONOR_STEPS = ['Account', 'Personal', 'Blood type']
const DONOR_HEADINGS = [
  { title: 'Account details', description: 'How you will sign in.' },
  { title: 'Personal details', description: 'Tell us who you are.' },
  { title: 'Blood type', description: 'The last thing we need.' },
]

function PasswordFields<T extends { password: string }>({ register, password }: { register: UseFormRegister<T>; password: string }) { const score = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password)].filter(Boolean).length; return <><Input label="Password" id="password" type="password" autoComplete="new-password" {...register('password' as never)} /><div aria-live="polite" className="space-y-1"><div className="flex gap-1">{[1, 2, 3, 4].map((level) => <span key={level} className={`h-1.5 flex-1 rounded ${level <= score ? score >= 3 ? 'bg-green-600' : 'bg-amber-500' : 'bg-slate-200'}`} />)}</div><p className="text-xs text-slate-500">Use 8+ characters with uppercase, lowercase, and a number.</p></div></> }
type DonorStepValidation = ReturnType<typeof donorAccountSchema.safeParse> | ReturnType<typeof donorPersonalSchema.safeParse>

export function RegisterPage() {
  const [variant, setVariant] = useState<Variant>('donor')
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const donor = useForm<DonorValues>({ resolver: zodResolver(donorSchema), mode: 'onTouched' })
  const host = useForm<HostValues>({ resolver: zodResolver(hostSchema), mode: 'onTouched' })
  const hospital = useForm<HospitalValues>({ resolver: zodResolver(hospitalSchema), mode: 'onTouched' })
  const changeVariant = (next: Variant) => { setVariant(next); setStep(1); setSuccess(null); setSubmitError(null) }

  // Each donor step validates only its own fields, so you are not told about questions further on.
  const setStepErrors = (form: UseFormReturn<DonorValues>, result: DonorStepValidation) => {
    form.clearErrors()
    if (!result.success) {
      result.error.issues.forEach((issue: { path: PropertyKey[]; message: string }) => { const field = issue.path[0]; if (typeof field === 'string') form.setError(field as never, { message: issue.message }) })
      const firstField = result.error.issues[0]?.path[0]
      if (typeof firstField === 'string') window.setTimeout(() => form.setFocus(firstField as never), 0)
      return false
    }
    return true
  }

  const submit = async (values: DonorValues | HostValues | HospitalValues) => {
    setSubmitError(null)
    try {
      const message = variant === 'donor' ? await authApi.registerDonor(values as DonorValues)
        : variant === 'host' ? await authApi.registerHoster(values as HostValues)
        : await authApi.registerHospital(values as HospitalValues)
      setSuccess(message)
    } catch (err: unknown) { setSubmitError(getErrorMessage(err)) }
  }

  if (success) return <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-lg items-center px-4 py-12">
    <div className="w-full rounded-xl border border-green-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">✓</div>
      <h1 className="app-title mt-5 text-3xl font-bold text-slate-950">Registration complete</h1>
      <p className="mt-3 text-slate-600">{success}</p>
      <Link to="/login" className="mt-6 inline-flex rounded-md bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800">Log in</Link>
    </div>
  </div>

  const donorSubmit = donor.handleSubmit(submit)
  const hostSubmit = host.handleSubmit(submit)
  const hospitalSubmit = hospital.handleSubmit(submit)
  const heading = DONOR_HEADINGS[step - 1]
  // Moving on only once the current step's own fields pass; going back never needs validating.
  const advance = () => {
    if (step === 1 && setStepErrors(donor, donorAccountSchema.safeParse(donor.getValues()))) setStep(2)
    else if (step === 2 && setStepErrors(donor, donorPersonalSchema.safeParse(donor.getValues()))) setStep(3)
    else if (step === 3) donorSubmit()
  }

  return <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
    <div className="text-center">
      <p className="eyebrow">Join the donation network</p>
      <h1 className="app-title mt-3 text-4xl font-bold text-slate-950">Create your account</h1>
      <p className="mt-3 text-slate-600">Choose the account that fits how you support blood donation.</p>
    </div>

    <div className="mt-8 grid grid-cols-3 gap-2 rounded-lg bg-slate-200 p-1">
      {([['donor', 'Donor'], ['host', 'Campaign host'], ['hospital', 'Hospital']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => changeVariant(value)} className={`rounded-md px-2 py-2 text-sm font-semibold ${variant === value ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600'}`}>{label}</button>)}
    </div>

    {/* Only the donor sign-up is long enough to be worth splitting up. */}
    {variant === 'donor' && <div className="mt-8"><Stepper steps={DONOR_STEPS} current={step - 1} onStepSelect={(index) => setStep(index + 1)} /></div>}

    {submitError && <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{submitError}</div>}

    <Card className="mt-8">
      {variant === 'donor' && <form onSubmit={(event) => { event.preventDefault(); advance() }}>
        <h2 className="text-xl font-bold text-slate-950">{heading.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{heading.description}</p>

        <div className="mt-5 space-y-5">
          {step === 1 && <>
            <Input label="Email" id="donor-email" type="email" {...donor.register('email')} error={donor.formState.errors.email?.message} />
            <Input label="Username" id="donor-username" {...donor.register('username')} error={donor.formState.errors.username?.message} />
            <PasswordFields register={donor.register} password={donor.watch('password', '')} />
            <Input label="Confirm password" id="donor-confirm" type="password" {...donor.register('confirmPassword')} error={donor.formState.errors.confirmPassword?.message} />
          </>}
          {step === 2 && <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="First name" id="first-name" {...donor.register('f_Name')} error={donor.formState.errors.f_Name?.message} />
              <Input label="Last name" id="last-name" {...donor.register('l_Name')} error={donor.formState.errors.l_Name?.message} />
            </div>
            <Input label="Sri Lankan NIC" id="nic" {...donor.register('nic')} error={donor.formState.errors.nic?.message} />
            <Input label="Date of birth" id="dob" type="date" {...donor.register('dob')} error={donor.formState.errors.dob?.message} />
            <Input label="Phone number" id="donor-phone" type="tel" {...donor.register('phoneNum')} error={donor.formState.errors.phoneNum?.message} />
          </>}
          {step === 3 && <>
            <Select label="Blood type" id="blood-type" {...donor.register('bloodType')}>
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((type) => <option key={type}>{type}</option>)}
            </Select>
            {donor.formState.errors.bloodType?.message && <p className="text-sm text-red-700">{donor.formState.errors.bloodType.message}</p>}
          </>}
        </div>

        <WizardNav
          onPrevious={step > 1 ? () => setStep(step - 1) : undefined}
          onNext={advance}
          nextLabel={step === 3 ? (donor.formState.isSubmitting ? 'Creating account...' : 'Create donor account') : 'Next'}
          busy={donor.formState.isSubmitting}
        />
      </form>}

      {variant === 'host' && <form onSubmit={(event) => { event.preventDefault(); hostSubmit() }}>
        <h2 className="text-xl font-bold text-slate-950">Campaign host account</h2>
        <p className="mt-1 text-sm text-slate-500">Register the organization that will run donation campaigns.</p>
        <div className="mt-5 space-y-5">
          <Input label="Organization name" id="org-name" {...host.register('orgName')} error={host.formState.errors.orgName?.message} />
          <Input label="Email" id="host-email" type="email" {...host.register('email')} error={host.formState.errors.email?.message} />
          <Input label="Phone number" id="host-phone" {...host.register('phoneNum')} error={host.formState.errors.phoneNum?.message} />
          <Input label="Username" id="host-username" {...host.register('username')} error={host.formState.errors.username?.message} />
          <PasswordFields register={host.register} password={host.watch('password', '')} />
        </div>
        <WizardNav onNext={hostSubmit} nextLabel={host.formState.isSubmitting ? 'Creating account...' : 'Create host account'} busy={host.formState.isSubmitting} />
      </form>}

      {variant === 'hospital' && <form onSubmit={(event) => { event.preventDefault(); hospitalSubmit() }}>
        <h2 className="text-xl font-bold text-slate-950">Hospital account</h2>
        <p className="mt-1 text-sm text-slate-500">Register the hospital that will request blood.</p>
        <div className="mt-5 space-y-5">
          <Input label="Hospital name" id="hospital-name" {...hospital.register('hospitalName')} error={hospital.formState.errors.hospitalName?.message} />
          <Input label="Address" id="hospital-address" {...hospital.register('address')} error={hospital.formState.errors.address?.message} />
          <Input label="Email" id="hospital-email" type="email" {...hospital.register('email')} error={hospital.formState.errors.email?.message} />
          <Input label="Phone number" id="hospital-phone" {...hospital.register('phoneNum')} error={hospital.formState.errors.phoneNum?.message} />
          <Input label="Username" id="hospital-username" {...hospital.register('username')} error={hospital.formState.errors.username?.message} />
          <PasswordFields register={hospital.register} password={hospital.watch('password', '')} />
        </div>
        <WizardNav onNext={hospitalSubmit} nextLabel={hospital.formState.isSubmitting ? 'Creating account...' : 'Create hospital account'} busy={hospital.formState.isSubmitting} />
      </form>}
    </Card>

    <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-red-700" to="/login">Log in</Link></p>
  </div>
}
