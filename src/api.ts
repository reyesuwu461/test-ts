import ky from "ky";
import Cookies from "js-cookie";
import type {
  Chart,
  Session,
  Summary,
  User,
  Vehicle,
  VehicleFormData,
  VehicleList,
} from "./types";

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  retry: 0,
  hooks: {
    beforeRequest: [request => {
      try {
        const token = Cookies.get("token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      } catch (e) {
        // ignore
      }
    }]
  }
});

export async function login(email: string, password: string) {
  const user: Session = await api
    .post("/api/login", { json: { email, password } })
    .json();
  return user;
}

export async function register(username: string, email: string, password: string) {
  const session: Session = await api
    .post("/api/register", { json: { username, email, password } })
    .json();
  return session;
}

export async function getUser() {
  const user: User = await api.get("/api/me").json();
  return user;
}

export async function getSummary() {
  const summary: Summary = await api.get("/api/summary").json();
  return summary;
}

export async function getChartData(
  type: "FUEL_TYPE" | "OEM" | "REGISTRATION_YEAR",
) {
  const chartData: Array<Chart> = await api
    .get("/api/chart", {
      searchParams: { type },
    })
    .json();
  return chartData;
}

export async function getVehicles(page: number, q: string) {
  const vehicles: VehicleList = await api
    .get("/api/vehicles", { searchParams: { page, q } })
    .json();
  return vehicles;
}

export async function getVehicle(id: string) {
  const vehicle: Vehicle = await api.get(`/api/vehicles/${id}`).json();
  return vehicle;
}

export async function deleteVehicle(id: string) {
  const result = await api.delete(`/api/vehicles/${id}`).json();
  return result;
}

export async function getManufacturers() {
  const manufacturers: Array<string> = await api
    .get("/api/manufacturers")
    .json();
  return manufacturers;
}

export async function getModels() {
  const models: Array<string> = await api.get("/api/models").json();
  return models;
}

export async function getTypes() {
  const types: Array<string> = await api.get("/api/types").json();
  return types;
}

export async function getColors() {
  const colors: Array<string> = await api.get("/api/colors").json();
  return colors;
}

export async function createVehicle(body: VehicleFormData) {
  const vehicle: Vehicle = await api
    .post("/api/vehicles", { json: body })
    .json();
  return vehicle;
}
