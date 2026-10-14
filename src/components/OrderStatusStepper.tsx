import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE, OrderStatus } from "@/lib/types";

export function OrderStatusStepper({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(status);

  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
      {ORDER_STATUS_SEQUENCE.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-3">
            <div
              data-testid={`step-${step}`}
              data-complete={isComplete}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                isComplete
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-neutral-300 text-neutral-400 dark:border-neutral-700"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                isCurrent
                  ? "text-orange-600"
                  : isComplete
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400"
              }`}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
            {index < ORDER_STATUS_SEQUENCE.length - 1 && (
              <div
                className={`hidden h-0.5 flex-1 sm:block ${
                  index < currentIndex ? "bg-orange-500" : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
