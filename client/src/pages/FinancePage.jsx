import React, { useMemo, useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { useApp } from "../context/AppContext";
import Donut from "../components/Donut";
import { CATEGORY_LIST, CATEGORY_COLORS } from "../constants";
import { uid, todayISO, formatNiceDate } from "../utils/date";

export default function FinancePage() {
  const { data, patch } = useApp();

  const [adding, setAdding] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    category: CATEGORY_LIST[0],
    amount: "",
    date: todayISO(),
  });

  /*
   * Existing transactions are treated as expenses.
   * New income transactions are stored separately in data.income.
   * This keeps your existing transaction data working.
   */
  const income = Array.isArray(data.income) ? data.income : [];

  const totalIncome = income.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalSpending = data.transactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const remainingBalance = totalIncome - totalSpending;

  /*
   * Monthly budget.
   * If no budget has been set yet, use 30000 as the default.
   */
  const monthlyBudget =
    Number(data.monthlyBudget) > 0
      ? Number(data.monthlyBudget)
      : 30000;

  const budgetRemaining = monthlyBudget - totalSpending;

  const budgetPercent =
    monthlyBudget > 0
      ? Math.min(
          100,
          Math.round((totalSpending / monthlyBudget) * 100)
        )
      : 0;

  const byCategory = CATEGORY_LIST
    .map((c) => ({
      label: c,
      color: CATEGORY_COLORS[c],
      value: data.transactions
        .filter((t) => t.category === c)
        .reduce(
          (sum, t) => sum + Number(t.amount || 0),
          0
        ),
    }))
    .filter((c) => c.value > 0);

  /*
   * Combine income + expenses for the transaction list.
   */
  const allTransactions = useMemo(() => {
    const expenses = data.transactions.map((tx) => ({
      ...tx,
      type: "expense",
    }));

    const incomes = income.map((tx) => ({
      ...tx,
      type: "income",
      category: tx.category || "Income",
    }));

    return [...expenses, ...incomes].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  }, [data.transactions, income]);

  const addTx = () => {
    const amt = Number(form.amount);

    if (!amt || amt <= 0) return;

    const newItem = {
      id: uid(),
      category:
        form.type === "income"
          ? form.category || "Income"
          : form.category,
      amount: amt,
      date: form.date,
    };

    if (form.type === "income") {
      patch({
        income: [newItem, ...income],
      });
    } else {
      patch({
        transactions: [
          newItem,
          ...data.transactions,
        ],
      });
    }

    setForm({
      type: "expense",
      category: CATEGORY_LIST[0],
      amount: "",
      date: todayISO(),
    });

    setAdding(false);
  };

  const removeTx = (id, type) => {
    if (type === "income") {
      patch({
        income: income.filter((item) => item.id !== id),
      });
    } else {
      patch({
        transactions: data.transactions.filter(
          (item) => item.id !== id
        ),
      });
    }
  };

  const saveBudget = (value) => {
    const budget = Number(value);

    if (!budget || budget <= 0) return;

    patch({
      monthlyBudget: budget,
    });
  };

  return (
    <>
      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

      <div className="exos-page-title">Finance</div>

      <div className="exos-page-sub">
        Track your income, spending, budget and remaining balance.
      </div>

      {/* ------------------------------------------------ */}
      {/* FINANCE SUMMARY */}
      {/* ------------------------------------------------ */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* TOTAL INCOME */}

        <div className="exos-card exos-card-pad">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--success-soft)",
                color: "var(--success)",
              }}
            >
              <TrendingUp size={17} />
            </div>

            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              TOTAL INCOME
            </span>
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 800,
              color: "var(--success)",
            }}
          >
            ₹{totalIncome.toLocaleString("en-IN")}
          </div>
        </div>

        {/* TOTAL SPENDING */}

        <div className="exos-card exos-card-pad">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--danger-soft)",
                color: "var(--danger)",
              }}
            >
              <TrendingDown size={17} />
            </div>

            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              TOTAL SPENDING
            </span>
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            ₹{totalSpending.toLocaleString("en-IN")}
          </div>
        </div>

        {/* REMAINING BALANCE */}

        <div className="exos-card exos-card-pad">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              <Wallet size={17} />
            </div>

            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              REMAINING BALANCE
            </span>
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 800,
              color:
                remainingBalance >= 0
                  ? "var(--success)"
                  : "var(--danger)",
            }}
          >
            ₹{remainingBalance.toLocaleString("en-IN")}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              color: "var(--text-tertiary)",
            }}
          >
            Income − Spending
          </div>
        </div>

        {/* BUDGET REMAINING */}

        <div className="exos-card exos-card-pad">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--warning-soft)",
                color: "var(--warning)",
              }}
            >
              <PiggyBank size={17} />
            </div>

            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              BUDGET LEFT
            </span>
          </div>

          <div
            style={{
              fontSize: 25,
              fontWeight: 800,
              color:
                budgetRemaining >= 0
                  ? "var(--success)"
                  : "var(--danger)",
            }}
          >
            ₹{Math.abs(budgetRemaining).toLocaleString("en-IN")}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              color: "var(--text-tertiary)",
            }}
          >
            {budgetRemaining >= 0
              ? "Available this month"
              : "Over budget"}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* BUDGET */}
      {/* ------------------------------------------------ */}

      <div
        className="exos-card exos-card-pad"
        style={{ marginBottom: 20 }}
      >
        <div className="exos-card-header">
          <div className="exos-card-title">
            <PiggyBank
              size={16}
              color="var(--accent)"
            />
            Monthly Budget
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              ₹{totalSpending.toLocaleString("en-IN")}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-tertiary)",
                }}
              >
                {" "}
                / ₹{monthlyBudget.toLocaleString("en-IN")}
              </span>
            </div>

            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                marginTop: 3,
              }}
            >
              {budgetPercent}% of your monthly budget used
            </div>
          </div>

          <input
            className="exos-input"
            type="number"
            min="1"
            defaultValue={monthlyBudget}
            onBlur={(e) =>
              saveBudget(e.target.value)
            }
            style={{
              width: 140,
            }}
            placeholder="Budget ₹"
          />
        </div>

        <div
          style={{
            width: "100%",
            height: 9,
            borderRadius: 20,
            background: "var(--card-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${budgetPercent}%`,
              height: "100%",
              borderRadius: 20,
              background:
                budgetPercent >= 100
                  ? "var(--danger)"
                  : "var(--accent)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 9,
            fontSize: 12,
            color:
              budgetRemaining >= 0
                ? "var(--text-secondary)"
                : "var(--danger)",
          }}
        >
          {budgetRemaining >= 0
            ? `₹${budgetRemaining.toLocaleString(
                "en-IN"
              )} remaining`
            : `₹${Math.abs(
                budgetRemaining
              ).toLocaleString(
                "en-IN"
              )} over budget`}
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* TRANSACTIONS + BREAKDOWN */}
      {/* ------------------------------------------------ */}

      <div className="exos-grid-2">
        {/* TRANSACTIONS */}

        <div className="exos-card exos-card-pad">
          <div className="exos-card-header">
            <div className="exos-card-title">
              Transactions
            </div>

            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              {allTransactions.length} total
            </div>
          </div>

          <div className="exos-tx-row head">
            <span />
            <span>Category</span>
            <span>Date</span>
            <span>Amount</span>
            <span />
          </div>

          {allTransactions.map((tx) => (
            <div
              className="exos-tx-row"
              key={`${tx.type}-${tx.id}`}
            >
              <span
                className="exos-legend-dot"
                style={{
                  background:
                    tx.type === "income"
                      ? "var(--success)"
                      : CATEGORY_COLORS[
                          tx.category
                        ] || "#999",
                }}
              />

              <span>
                {tx.category}
              </span>

              <span
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                {formatNiceDate(tx.date)}
              </span>

              <span
                style={{
                  fontWeight: 700,
                  color:
                    tx.type === "income"
                      ? "var(--success)"
                      : "var(--text)",
                }}
              >
                {tx.type === "income"
                  ? "+"
                  : "-"}
                ₹
                {Number(
                  tx.amount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

              <button
                className="exos-mini-btn danger"
                onClick={() =>
                  removeTx(
                    tx.id,
                    tx.type
                  )
                }
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {allTransactions.length === 0 && (
            <div className="exos-empty-state">
              No transactions yet.
            </div>
          )}

          {/* ADD FORM */}

          {adding ? (
            <div
              className="exos-add-inline"
              style={{
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <select
                className="exos-select"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>

              {form.type === "expense" ? (
                <select
                  className="exos-select"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                >
                  {CATEGORY_LIST.map(
                    (c) => (
                      <option
                        key={c}
                        value={c}
                      >
                        {c}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  className="exos-input"
                  style={{
                    maxWidth: 150,
                  }}
                  placeholder="Income name"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                />
              )}

              <input
                className="exos-input"
                style={{
                  maxWidth: 130,
                }}
                type="number"
                min="1"
                placeholder="Amount ₹"
                autoFocus
                value={form.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount:
                      e.target.value,
                  })
                }
              />

              <input
                className="exos-input"
                style={{
                  maxWidth: 160,
                }}
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: e.target.value,
                  })
                }
              />

              <button
                className="exos-btn-primary"
                onClick={addTx}
              >
                <Plus size={14} />
                Add
              </button>

              <button
                className="exos-btn-ghost"
                onClick={() =>
                  setAdding(false)
                }
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="exos-add-link"
              onClick={() =>
                setAdding(true)
              }
            >
              <Plus size={14} />
              Add transaction
            </button>
          )}
        </div>

        {/* BREAKDOWN */}

        <div className="exos-card exos-card-pad">
          <div className="exos-card-header">
            <div className="exos-card-title">
              Spending Breakdown
            </div>
          </div>

          <div className="exos-donut-wrap">
            <Donut
              segments={
                byCategory.length
                  ? byCategory
                  : [
                      {
                        value: 1,
                        color:
                          "var(--card-border)",
                      },
                    ]
              }
              size={130}
            />

            <div
              style={{
                flex: 1,
              }}
            >
              {byCategory.map(
                (c) => (
                  <div
                    className="exos-legend-item"
                    key={c.label}
                  >
                    <span
                      className="exos-legend-dot"
                      style={{
                        background:
                          c.color,
                      }}
                    />

                    {c.label}

                    <span className="exos-legend-amt">
                      ₹
                      {c.value.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )
              )}

              {byCategory.length ===
                0 && (
                <div
                  style={{
                    fontSize: 12,
                    color:
                      "var(--text-tertiary)",
                  }}
                >
                  No spending data yet.
                </div>
              )}
            </div>
          </div>

          {/* QUICK STATS */}

          <div
            style={{
              marginTop: 22,
              paddingTop: 16,
              borderTop:
                "1px solid var(--card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: 10,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                Largest category
              </span>

              <strong>
                {byCategory.length
                  ? [...byCategory].sort(
                      (a, b) =>
                        b.value -
                        a.value
                    )[0].label
                  : "—"}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                fontSize: 12,
              }}
            >
              <span
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                Average spending
              </span>

              <strong>
                ₹
                {data.transactions
                  .length
                  ? Math.round(
                      totalSpending /
                        data
                          .transactions
                          .length
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "0"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* FINANCIAL SUMMARY */}
      {/* ------------------------------------------------ */}

      <div
        className="exos-card exos-card-pad"
        style={{
          marginTop: 20,
        }}
      >
        <div className="exos-card-header">
          <div className="exos-card-title">
            Financial Summary
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color:
                  "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              Total Money In
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color:
                  "var(--success)",
              }}
            >
              +₹
              {totalIncome.toLocaleString(
                "en-IN"
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color:
                  "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              Total Money Out
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color:
                  "var(--danger)",
              }}
            >
              -₹
              {totalSpending.toLocaleString(
                "en-IN"
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color:
                  "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              Net Balance
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color:
                  remainingBalance >=
                  0
                    ? "var(--success)"
                    : "var(--danger)",
              }}
            >
              ₹
              {remainingBalance.toLocaleString(
                "en-IN"
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 12,
                color:
                  "var(--text-secondary)",
                marginBottom: 5,
              }}
            >
              Spending Rate
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {totalIncome > 0
                ? Math.round(
                    (totalSpending /
                      totalIncome) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </div>
    </>
  );
}