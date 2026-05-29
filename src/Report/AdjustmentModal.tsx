import { useEffect, useState } from "react";

import {
  adjustOrder,
  getSettledOrders
} from "../Api/reportApi";

type Order = {
  id: number;
  tableName: string;
  total: number;
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

const AdjustmentModal = ({
  onClose,
  onSuccess
}: Props) => {

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [selectedOrder,
    setSelectedOrder] =
    useState<number | null>(null);

  const [amount, setAmount] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ───────────────────────────────────────────
  // LOAD ORDERS
  // ───────────────────────────────────────────

  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders = async () => {

    try {

      const data =
        await getSettledOrders();

      setOrders(data);

    } catch (err) {

      console.error(err);
    }
  };

  // ───────────────────────────────────────────
  // SAVE
  // ───────────────────────────────────────────

  const handleSubmit = async () => {

    if (!selectedOrder) {

      alert("Select Order");

      return;
    }

    try {

      setLoading(true);

      await adjustOrder(
        selectedOrder,
        {
          amount: Number(amount),
          reason,
          type: "WRONG_ENTRY",
          adjustedBy: "Admin",
        }
      );

      alert("Adjustment Added");

      onSuccess();

      onClose();

    } catch (err) {

      console.error(err);

      alert("Failed");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-[420px]">

        <h2 className="text-2xl font-bold mb-2">

          Accounting Adjustment

        </h2>

        <p className="text-sm text-red-500 mb-4">

          This adjustment will reduce report totals.

        </p>

        {/* SELECT ORDER */}

        <select

          value={selectedOrder ?? ""}

          onChange={(e) =>
            setSelectedOrder(
              Number(e.target.value)
            )
          }

          className="w-full border p-2 rounded mb-3"

        >

          <option value="">
            Select Order
          </option>

          {orders.map((order) => (

            <option
              key={order.id}
              value={order.id}
            >

              #{order.id}
              {" - "}
              {order.tableName}
              {" - ₹"}
              {order.total}

            </option>

          ))}

        </select>

        {/* AMOUNT */}

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="w-full border p-2 rounded mb-3"
        />

        {/* REASON */}

        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          className="w-full border p-2 rounded mb-4"
        />

        {/* BUTTONS */}

        <div className="flex gap-3">

          <button

            onClick={handleSubmit}

            disabled={loading}

            className="bg-green-700 text-white px-4 py-2 rounded"

          >

            {loading
              ? "Saving..."
              : "Save"}

          </button>

          <button

            onClick={onClose}

            className="bg-gray-300 px-4 py-2 rounded"

          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default AdjustmentModal;