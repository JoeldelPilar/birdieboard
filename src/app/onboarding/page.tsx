'use client';

import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
import { TextInput } from '@/components/ui/text-input';
import { IconCheck, IconGolf, IconLoader2, IconMapPin, IconUser } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CountrySelect } from '@/components/profile/country-select';
import { createProfile } from '@/server/actions/profile';

const TOTAL_STEPS = 3;

interface FormData {
  displayName: string;
  handicap: string;
  country: string;
  city: string;
}

interface StepErrors {
  displayName?: string;
  handicap?: string;
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8" role="status" aria-label={`Step ${currentStep} of ${TOTAL_STEPS}`}>
      <div className="mb-2 flex justify-between text-xs font-medium text-white/80">
        <span>
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={false}
          animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<StepErrors>({});

  const [formData, setFormData] = useState<FormData>({
    displayName: session?.user?.name ?? '',
    handicap: '',
    country: '',
    city: '',
  });

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validateStep1(): boolean {
    const name = formData.displayName.trim();
    if (name.length < 2) {
      setErrors({ displayName: 'Display name must be at least 2 characters.' });
      return false;
    }
    return true;
  }

  function validateStep2(): boolean {
    const raw = formData.handicap.trim();
    if (raw === '') return true; // empty is allowed — user can skip
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0 || value > 54) {
      setErrors({ handicap: 'Handicap must be a number between 0 and 54.' });
      return false;
    }
    return true;
  }

  function handleNext() {
    setErrors({});
    setServerError(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    setErrors({});
    setServerError(null);
    setStep((prev) => Math.max(1, prev - 1));
  }

  async function handleSubmit() {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setServerError(null);

    const handicapValue = formData.handicap.trim() !== '' ? parseFloat(formData.handicap) : null;

    const result = await createProfile({
      displayName: formData.displayName.trim(),
      handicapIndex: handicapValue ?? undefined,
      country: formData.country || undefined,
      city: formData.city.trim() || undefined,
      isPublic: true,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    // Force JWT refresh so middleware sees hasProfile=true before redirect
    await update();

    setIsDone(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1800);
  }

  if (isDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 text-center text-white"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <IconCheck className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
        <p className="text-white/80">Taking you to your dashboard...</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center justify-center gap-3">
        <IconGolf className="h-8 w-8 text-white" aria-hidden="true" />
        <span className="text-2xl font-bold text-white">Birdieboard</span>
      </div>

      <ProgressBar currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-2xl">
              <CardHeader className="flex-col items-start gap-2 px-6 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golf-green/10">
                  <IconUser className="h-6 w-6 text-golf-green" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold">Welcome to Birdieboard</h1>
                <p className="text-sm text-default-500">
                  Let&apos;s set up your golfer profile. This takes less than a minute.
                </p>
              </CardHeader>
              <CardBody className="px-6 py-4">
                <TextInput
                  label="Display Name"
                  placeholder="How should other golfers know you?"
                  value={formData.displayName}
                  onValueChange={(v) => updateField('displayName', v)}
                  isRequired
                  autoFocus
                  errorMessage={errors.displayName}
                  isInvalid={!!errors.displayName}
                  description="Min 2 characters. This is what others will see."
                />
              </CardBody>
              <CardFooter className="px-6 pb-6">
                <Button
                  color="success"
                  className="w-full font-semibold"
                  onPress={handleNext}
                  endContent={<span aria-hidden="true">&rarr;</span>}
                >
                  Continue
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-2xl">
              <CardHeader className="flex-col items-start gap-2 px-6 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golf-green/10">
                  <IconGolf className="h-6 w-6 text-golf-green" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold">Your Handicap Index</h1>
                <p className="text-sm text-default-500">
                  Your handicap index is a number (0&ndash;54) that represents your playing ability.
                  Lower is better. A scratch golfer has 0, a beginner might start at 54.
                </p>
              </CardHeader>
              <CardBody className="px-6 py-4">
                <TextInput
                  label="Handicap Index"
                  placeholder="e.g. 12.3"
                  type="number"
                  min={0}
                  max={54}
                  step={0.1}
                  value={formData.handicap}
                  onValueChange={(v) => updateField('handicap', v)}
                  errorMessage={errors.handicap}
                  isInvalid={!!errors.handicap}
                  description="Decimal allowed, e.g. 12.3. You can update this anytime."
                  endContent={<span className="text-sm">HCP</span>}
                />
              </CardBody>
              <CardFooter className="flex-col gap-3 px-6 pb-6">
                <Button
                  color="success"
                  className="w-full font-semibold"
                  onPress={handleNext}
                  endContent={<span aria-hidden="true">&rarr;</span>}
                >
                  Continue
                </Button>
                <Button
                  variant="flat"
                  className="w-full"
                  onPress={() => {
                    updateField('handicap', '');
                    setErrors({});
                    setStep(3);
                  }}
                >
                  I don&apos;t know my handicap yet
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onPress={handleBack}>
                  Back
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-2xl">
              <CardHeader className="flex-col items-start gap-2 px-6 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-golf-green/10">
                  <IconMapPin className="h-6 w-6 text-golf-green" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold">Where Do You Play?</h1>
                <p className="text-sm text-default-500">
                  Optional. Helps you discover local courses and connect with nearby golfers.
                </p>
              </CardHeader>
              <CardBody className="flex flex-col gap-4 px-6 py-4">
                <CountrySelect
                  value={formData.country}
                  onChange={(v) => updateField('country', v)}
                />
                <TextInput
                  label="City"
                  placeholder="e.g. Stockholm"
                  value={formData.city}
                  onValueChange={(v) => updateField('city', v)}
                />
              </CardBody>
              <CardFooter className="flex-col gap-3 px-6 pb-6">
                {serverError && (
                  <p className="w-full rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                    {serverError}
                  </p>
                )}
                <Button
                  color="success"
                  className="w-full font-semibold"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                  startContent={
                    !isSubmitting ? (
                      <IconCheck className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <IconLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    )
                  }
                >
                  {isSubmitting ? 'Creating profile...' : 'Finish setup'}
                </Button>
                <Button
                  variant="flat"
                  className="w-full"
                  isDisabled={isSubmitting}
                  onPress={() => {
                    updateField('country', '');
                    updateField('city', '');
                    void handleSubmit();
                  }}
                >
                  Skip location
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  isDisabled={isSubmitting}
                  onPress={handleBack}
                >
                  Back
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
