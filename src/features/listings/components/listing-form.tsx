'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AddressAutocomplete, type AddressResult } from '@/features/listings/components/address-autocomplete';
import { createListingAction, updateListingAction } from '@/features/listings/lib/actions';

const schema = z.object({
  type: z.enum(['PRIVATE_ROOM', 'SHARED_ROOM', 'WHOLE_UNIT']),
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(2000),
  addressLine: z.string().min(3).max(200),
  city: z.string().min(1).max(120),
  neighborhood: z.string().max(120).optional(),
  postalCode: z.string().min(3).max(10),
  latitude: z.number(),
  longitude: z.number(),
  rentAmount: z.number().int().positive(),
  depositAmount: z.number().int().positive().optional(),
  utilitiesIncluded: z.boolean(),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leaseMonths: z.number().int().min(1),
  bedroomsTotal: z.number().int().min(0),
  bathroomsTotal: z.number().min(0),
  furnished: z.boolean(),
  smokingAllowed: z.boolean(),
  petsAllowed: z.boolean(),
  genderPref: z.enum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY', 'NON_BINARY_INCLUSIVE']),
  amenities: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  listingId?: string;
  initial?: Partial<FormValues>;
};

export function ListingForm({ listingId, initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'PRIVATE_ROOM',
      utilitiesIncluded: false,
      furnished: false,
      smokingAllowed: false,
      petsAllowed: false,
      genderPref: 'ANY',
      amenities: [],
      latitude: 51.0447,
      longitude: -114.0719,
      leaseMonths: 12,
      bedroomsTotal: 1,
      bathroomsTotal: 1,
      ...initial,
    },
  });

  function handleAddressSelect(result: AddressResult) {
    setValue('addressLine', result.addressLine, { shouldValidate: true });
    setValue('city', result.city, { shouldValidate: true });
    setValue('postalCode', result.postalCode, { shouldValidate: true });
    setValue('neighborhood', result.neighborhood || undefined);
    setValue('latitude', result.latitude, { shouldValidate: true });
    setValue('longitude', result.longitude, { shouldValidate: true });
  }

  const onSubmit = (data: FormValues) => {
    setError(null);
    startTransition(async () => {
      try {
        if (listingId) {
          await updateListingAction(listingId, data);
        } else {
          await createListingAction(data);
        }
      } catch (err) {
        setError(String(err));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="type">Listing type</Label>
        <Select id="type" {...register('type')}>
          <option value="PRIVATE_ROOM">Private room</option>
          <option value="SHARED_ROOM">Shared room</option>
          <option value="WHOLE_UNIT">Whole unit</option>
        </Select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Cozy private room in downtown Calgary" {...register('title')} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={5} placeholder="Describe the space, the household, what you're looking for..." {...register('description')} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <AddressAutocomplete
          onSelect={handleAddressSelect}
          defaultValue={initial?.addressLine ?? ''}
          error={errors.addressLine?.message ?? errors.latitude?.message ?? errors.city?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rentAmount">Rent (CAD/mo)</Label>
          <Input id="rentAmount" type="number" {...register('rentAmount', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depositAmount">Deposit (optional)</Label>
          <Input id="depositAmount" type="number" {...register('depositAmount', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leaseMonths">Lease (months)</Label>
          <Input id="leaseMonths" type="number" min={1} {...register('leaseMonths', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedroomsTotal">Bedrooms</Label>
          <Input id="bedroomsTotal" type="number" min={0} {...register('bedroomsTotal', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathroomsTotal">Bathrooms</Label>
          <Input id="bathroomsTotal" type="number" min={0} step={0.5} {...register('bathroomsTotal', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableFrom">Available from</Label>
          <Input id="availableFrom" type="date" {...register('availableFrom')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="genderPref">Gender preference for tenant</Label>
        <Select id="genderPref" {...register('genderPref')}>
          <option value="ANY">Any gender</option>
          <option value="FEMALE_ONLY">Female only</option>
          <option value="MALE_ONLY">Male only</option>
          <option value="NON_BINARY_INCLUSIVE">Non-binary inclusive</option>
        </Select>
      </div>

      <div className="flex flex-wrap gap-6">
        <Checkbox id="utilitiesIncluded" label="Utilities included" {...register('utilitiesIncluded')} />
        <Checkbox id="furnished" label="Furnished" {...register('furnished')} />
        <Checkbox id="smokingAllowed" label="Smoking allowed" {...register('smokingAllowed')} />
        <Checkbox id="petsAllowed" label="Pets allowed" {...register('petsAllowed')} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : listingId ? 'Save changes' : 'Create listing'}
      </Button>
    </form>
  );
}
