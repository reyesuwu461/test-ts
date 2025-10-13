import type * as React from "react";
import { Form, useLoaderData, useNavigation, Link } from "react-router-dom";
import { getVehicle, getUser } from "../api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/breadcrumb";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { LoadingButton } from "../components/loading-button";
import { Separator } from "../components/separator";
import { getColorName, getWebColor } from "../lib/color";
import { formatCurrency, formatNumber } from "../lib/intl";
import { fuelLabels } from "../lib/labels";
import { privateLoader } from "../lib/private-loader";
import type { Vehicle } from "../types";

function Detail(props: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <>
      <dt className="font-semibold text-muted-foreground">{props.label}</dt>
      <dd className="mb-4 last:mb-0">{props.value}</dd>
    </>
  );
}

function DeleteButton(props: { submitting: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent asChild>
        <Form method="post" action="destroy">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this vehicle?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              vehicle from your stock inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* We need a form submit button here */}
            <LoadingButton
              type="submit"
              variant="destructive"
              loading={props.submitting}
            >
              Delete
            </LoadingButton>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const loader = privateLoader(async ({ params }) => {
  const vehicle = await getVehicle(params.id as string);
  const user = await getUser();
  return { vehicle, user };
});

// TODO: use defer
export function Component() {
  const data = useLoaderData() as { vehicle: Vehicle; user: any };
  const vehicle = data.vehicle as Vehicle;
  const currentUser = data.user as { id?: string; role?: string };
  const navigation = useNavigation();

  return (
    <>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to="/vehicles">Vehicles</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{vehicle.vrm}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>{vehicle.vrm}</CardTitle>
          <CardDescription>
            {vehicle.manufacturer} {vehicle.model}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent>
          <dl className="mt-6 text-base">
            <Detail label="Manufacturer" value={vehicle.manufacturer} />
            <Detail label="Model" value={vehicle.model} />
            <Detail label="Type" value={vehicle.type} />
            <Detail label="Fuel" value={fuelLabels[vehicle.fuel]} />
            <Detail
              label="Colour"
              value={
                <div className="flex items-center gap-1.5">
                  <div
                    className="size-4 shrink-0 rounded-full border"
                    style={{ backgroundColor: getWebColor(vehicle.color) }}
                  />
                  <span>{getColorName(vehicle.color)}</span>
                </div>
              }
            />
            <Detail label="Mileage" value={formatNumber(vehicle.mileage)} />
            <Detail
              label="Price"
              value={formatCurrency(parseInt(vehicle.price, 10), {
                minimumFractionDigits: 0,
              })}
            />
            <Detail
              label="Registration date"
              value={new Intl.DateTimeFormat("en-GB", {
                dateStyle: "long",
              }).format(new Date(vehicle.registrationDate))}
            />
            <Detail label="VIN" value={vehicle.vin} />
          </dl>
        </CardContent>
        <CardFooter className="flex gap-2">
          {currentUser?.role === "rolos admir" && currentUser?.id === vehicle.ownerId && (
            <>
              <Link to={`/add?id=${vehicle.id}`}>
                <Button>Edit</Button>
              </Link>
              <DeleteButton submitting={navigation.state === "submitting"} />
            </>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
