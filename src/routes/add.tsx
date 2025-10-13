import type { ActionFunctionArgs } from "react-router-dom";
import { Form, Link, redirect, useLoaderData, useSearchParams } from "react-router-dom";
import {
  createVehicle,
  getColors,
  getManufacturers,
  getModels,
  getTypes,
  getVehicle,
  updateVehicle,
} from "../api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/breadcrumb";
import { Button } from "../components/button";
import { Card, CardContent, CardFooter } from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Select } from "../components/select";
import { Separator } from "../components/separator";
import { getColorName } from "../lib/color";
import { privateLoader } from "../lib/private-loader";

export const loader = privateLoader(async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  const [manufacturers, models, types, colors] = await Promise.all([
    getManufacturers(),
    getModels(),
    getTypes(),
    getColors(),
  ]);

  if (id) {
    const vehicle = await getVehicle(id);
    return { manufacturers, models, types, colors, vehicle };
  }

  return { manufacturers, models, types, colors };
});

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const formData = await request.formData();

  const body = {
    vrm: formData.get("vrm") as string,
    manufacturer: formData.get("manufacturer") as string,
    model: formData.get("model") as string,
    type: formData.get("type") as string,
    color: formData.get("color") as string,
    fuel: formData.get("fuel") as string,
    mileage: Number(formData.get("mileage")),
    price: formData.get("price") as string,
    registrationDate: formData.get("registrationDate") as string,
    vin: formData.get("vin") as string,
  };

  if (id) {
    const vehicle = await updateVehicle(id, body);
    return redirect(`/vehicles/${vehicle.id}`);
  }

  const vehicle = await createVehicle(body);
  return redirect(`/vehicles/${vehicle.id}`);
}

export function Component() {
  const { manufacturers, models, types, colors } = useLoaderData() as {
    manufacturers: Array<string>;
    models: Array<string>;
    types: Array<string>;
    colors: Array<string>;
    vehicle?: any;
  };

  const params = useSearchParams()[0];
  const editId = params.get("id");
  const vehicle = (useLoaderData() as any).vehicle;

  return (
    <>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add Vehicle</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Form method="post">
        <Card>
          <CardContent className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* VRM */}
            <div className="space-y-1">
              <Label htmlFor="vrm">Registration number</Label>
              <Input id="vrm" name="vrm" type="text" required defaultValue={vehicle?.vrm ?? ''} />
            </div>

            <Separator className="col-span-full" />

            {/* Manufacturer */}
            <div className="col-start-1 space-y-1">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select
                id="manufacturer"
                name="manufacturer"
                defaultValue={vehicle?.manufacturer ?? ''}
                required
              >
                <option value="" disabled>
                  Select a manufacturer
                </option>
                {manufacturers.map((manufacturer) => (
                  <option key={manufacturer}>{manufacturer}</option>
                ))}
              </Select>
            </div>

            {/* Model */}
            <div className="space-y-1">
              <Label htmlFor="model">Model</Label>
              <Select id="model" name="model" defaultValue={vehicle?.model ?? ''} required>
                <option value="" disabled>
                  Select a model
                </option>
                {models.map((model) => (
                  <option key={model}>{model}</option>
                ))}
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" defaultValue={vehicle?.type ?? ''} required>
                <option value="" disabled>
                  Select a type
                </option>
                {types.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-1">
              <Label htmlFor="color">Colour</Label>
              <Select id="color" name="color" defaultValue={vehicle?.color ?? ''} required>
                <option value="" disabled>
                  Select a colour
                </option>
                {colors.map((color) => (
                  <option key={color}>{getColorName(color)}</option>
                ))}
              </Select>
            </div>

            {/* Fuel type */}
            <div className="space-y-1">
              <Label htmlFor="fuel">Fuel</Label>
              <Select id="fuel" name="fuel" defaultValue={vehicle?.fuel ?? ''} required>
                <option value="" disabled>
                  Select a fuel type
                </option>
                <option value="Gasoline">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </Select>
            </div>

            {/* Mileage */}
            <div className="space-y-1">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                type="text"
                inputMode="numeric"
                required
                pattern="\d*"
                title="Only whole numbers are allowed"
                defaultValue={vehicle?.mileage ?? ''}
              />
            </div>

            {/* Registration date */}
            <div className="space-y-1">
              <Label htmlFor="registrationDate">Registration date</Label>
              <Input
                id="registrationDate"
                name="registrationDate"
                type="date"
                required
                defaultValue={vehicle?.registrationDate ?? ''}
              />
            </div>

            {/* VIN */}
            <div className="space-y-1">
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" name="vin" type="text" required defaultValue={vehicle?.vin ?? ''} />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="text"
                inputMode="numeric"
                required
                pattern="\d*"
                title="Only whole numbers are allowed"
                defaultValue={vehicle?.price ?? ''}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit">{editId ? 'Save' : 'Add'}</Button>
          </CardFooter>
        </Card>
      </Form>
    </>
  );
}
Component.displayName = "Add";
