import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "routes/login.tsx"),
    route("try-demo", "routes/try-demo.tsx"),

    layout("routes/dashboard/layout.tsx", [
        route("dashboard", "routes/dashboard/home.tsx"),
        route("dashboard/choose-role", "routes/dashboard/choose-role.tsx"),
        route("dashboard/organizations", "routes/dashboard/organizations.tsx"),
        route("dashboard/users", "routes/dashboard/users.tsx"),
        route("dashboard/inspections", "routes/dashboard/inspections.tsx"),
        route("dashboard/evidence", "routes/dashboard/evidence.tsx"),
        route("dashboard/reports", "routes/dashboard/reports.tsx"),
        route("dashboard/tasks", "routes/dashboard/tasks.tsx"),
        route("dashboard/task-evidence", "routes/dashboard/task-evidence.tsx"),
    ]),

    layout("routes/demo/layout.tsx", [
        route("demo", "routes/demo/home.tsx"),
        route("demo/users", "routes/demo/users.tsx"),
        route("demo/inspections", "routes/demo/inspections.tsx"),
        route("demo/evidence", "routes/demo/evidence.tsx"),
        route("demo/reports", "routes/demo/reports.tsx"),
        route("demo/tasks", "routes/demo/tasks.tsx"),
        route("demo/task-evidence", "routes/demo/task-evidence.tsx"),
    ]),
] satisfies RouteConfig;
