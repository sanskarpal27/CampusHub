"use client"

import { useActionState } from "react"
import { saveProfile, type ProfileActionState } from "@/app/actions/profile"
import { Loader2, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    saveProfile,
    {}
  )

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          We need a few details before you can access CampusHub.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow-sm ring-1 ring-slate-100 sm:rounded-2xl sm:px-10">
          <form action={action} className="space-y-6">
            {state?.error && (
              <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  className="block w-full appearance-none rounded-xl border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                Hostel / Local Address
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  required
                  placeholder="e.g. Room 402, Ramanujan Hostel"
                  className="block w-full appearance-none rounded-xl border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-slate-700">
                  Course
                </label>
                <div className="mt-1">
                  <select
                    id="course"
                    name="course"
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                    <option value="B.Tech ECE">B.Tech ECE</option>
                    <option value="B.Tech ME">B.Tech ME</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="batch_year" className="block text-sm font-medium text-slate-700">
                  Batch / Graduation Year
                </label>
                <div className="mt-1">
                  <select
                    id="batch_year"
                    name="batch_year"
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Finish Setup
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
