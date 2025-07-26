import { NextResponse } from "next/server";

const USERS_URL = process.env.NEXT_PUBLIC_USERS_URL;

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const userId = request.cookies.get("auth-token")?.value;

    if (!userId) {
      return showAccessDeniedPage();
    }

    try {
      const res = await fetch(USERS_URL);
      const data = await res.json();
      const usersArray = Object.values(data);

      const currentUser = usersArray.find((user) => user.id === userId);

      if (!currentUser || currentUser.role !== "admin") {
        return showAccessDeniedPage();
      }

      return NextResponse.next();
    } catch (err) {
      console.error("Error checking user role:", err);
      return showAccessDeniedPage();
    }
  }

  return NextResponse.next();
}

function showAccessDeniedPage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Access Denied</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
            padding: 1rem;
          }

          .card {
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            text-align: center;
          }

          .card img {
            width: 100%;
            max-width: 500px;
            height: auto;
            margin-bottom: 1.5rem;
            border-radius: 0.75rem;
          }

          .card h1 {
            font-size: 1.75rem;
            color: #e53935;
            margin-bottom: 0.5rem;
          }

          .card p {
            font-size: 1rem;
            color: #e53935;
            margin-bottom: 1.5rem;
          }

          .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #1976d2;
            color: white;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: background-color 0.3s ease;
          }

          .btn:hover {
            background-color: #115293;
          }

          @media (max-width: 640px) {
            .card {
              padding: 1rem;
            }

            .card h1 {
              font-size: 1.5rem;
            }

            .card p {
              font-size: 0.95rem;
            }

            .card img {
              height: 280px;
              object-fit: cover;
            }

            .btn {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="https://smartcom-tech.vercel.app/unauthorized.png" alt="Access Denied" />
          <h1>You are not authorized</h1>
          <p>You Are Not Allowed To View This Page, Only Admins Can View !</p>
          <a class="btn" href="/">Back Home</a>
        </div>
      </body>
    </html>
  `;
  return new NextResponse(html, {
    status: 403,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
