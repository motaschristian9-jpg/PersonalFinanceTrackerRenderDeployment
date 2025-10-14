import React from "react";

const shimmer =
  "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200";

// Desktop + Mobile Summary Skeleton
export const TransactionSummarySkeleton = () => (
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-30"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${shimmer}`}
            ></div>
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-24 rounded ${shimmer}`}></div>
              <div className={`h-6 sm:h-8 w-32 rounded ${shimmer}`}></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </section>
);

// Table skeleton for desktop
export const TransactionTableSkeleton = () => (
  <>
    {/* Filters Skeleton */}
    <section className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/30 to-gray-300/20 rounded-xl blur opacity-40"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-end gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${shimmer}`}></div>
            <div className="space-y-2">
              <div className={`h-3 w-20 rounded ${shimmer}`}></div>
              <div className={`h-9 w-40 rounded-lg ${shimmer}`}></div>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-lg ${shimmer}`}></div>
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-32 rounded ${shimmer}`}></div>
              <div className={`h-9 w-full rounded-lg ${shimmer}`}></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Desktop Table Skeleton */}
    <section className="relative hidden md:block">
      <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
        <div className="p-6 border-b border-green-100/50">
          <div className={`h-6 w-48 rounded ${shimmer} mb-2`}></div>
          <div className={`h-4 w-32 rounded ${shimmer}`}></div>
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-green-50/50 sticky top-0">
                <tr>
                  {[
                    "Date",
                    "Category",
                    "Description",
                    "Amount",
                    "Type",
                    "Actions",
                  ].map((col, i) => (
                    <th
                      key={i}
                      className="py-4 px-6 font-semibold text-gray-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100/50">
                    <td className="py-4 px-6">
                      <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-6 w-20 rounded-full ${shimmer}`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-4 w-24 rounded ${shimmer}`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-6 w-16 rounded-full ${shimmer}`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <div className={`h-8 w-8 rounded-lg ${shimmer}`}></div>
                        <div className={`h-8 w-8 rounded-lg ${shimmer}`}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    {/* Mobile Cards Skeleton */}
    <section className="relative md:hidden">
      <div className="absolute -inset-1 bg-gradient-to-r from-green-200/30 to-green-300/20 rounded-2xl blur opacity-40"></div>
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100/50 overflow-hidden">
        <div className="p-4 border-b border-green-100/50">
          <div className={`h-5 w-40 rounded ${shimmer} mb-2`}></div>
          <div className={`h-4 w-32 rounded ${shimmer}`}></div>
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between space-x-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full ${shimmer}`}></div>
                    <div className="flex-1 space-y-2">
                      <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                      <div className="flex space-x-2">
                        <div className={`h-5 w-16 rounded ${shimmer}`}></div>
                        <div className={`h-5 w-20 rounded ${shimmer}`}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className={`h-3 w-24 rounded ${shimmer}`}></div>
                    <div className={`h-5 w-20 rounded ${shimmer}`}></div>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className={`h-8 w-8 rounded-lg ${shimmer}`}></div>
                  <div className={`h-8 w-8 rounded-lg ${shimmer}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);
