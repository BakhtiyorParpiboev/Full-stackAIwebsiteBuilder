import { Settings } from "@/components/auth/settings/settings";

const SecuritySettingsDemo = () => {
  return (
    <main className="dark min-h-[calc(100vh-73px)] bg-gray-950 px-4 py-10 text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Security</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
            Keep your WebBuilder account protected with password and session controls.
          </p>
        </header>
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-2xl shadow-indigo-950/20 sm:p-6">
          <Settings
            view="security"
            className="mt-0 [&_[data-slot=tabs-list]]:border [&_[data-slot=tabs-list]]:border-gray-800 [&_[data-slot=tabs-list]]:bg-gray-950/70"
          />
        </section>
      </div>
    </main>
  );
}

export default SecuritySettingsDemo;
