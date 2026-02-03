import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("try-demo", "routes/try-demo.tsx"),

    layout("routes/dashboard/layout.tsx", [
        route("dashboard", "routes/dashboard/home.tsx"),
        route("dashboard/organizations", "routes/dashboard/organizations.tsx"),
        route("dashboard/users", "routes/dashboard/users.tsx"),
        route("dashboard/inspections", "routes/dashboard/inspections.tsx"),
        route("dashboard/evidence", "routes/dashboard/evidence.tsx"),
        route("dashboard/reports", "routes/dashboard/reports.tsx"),
        route("dashboard/tasks", "routes/dashboard/tasks.tsx"),
    ]),
] satisfies RouteConfig;
