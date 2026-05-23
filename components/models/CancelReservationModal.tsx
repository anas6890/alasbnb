"use client";

import { useCallback, useMemo, useState } from "react";
import Modal from "./Modal";
import useLanguage from "@/hook/useLanguage";
import { translations } from "@/lib/translations";
import { SafeReservation } from "@/types";

interface CancelReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: SafeReservation | null;
  isHost?: boolean;
  isLoading?: boolean;
}

const CancelReservationModal: React.FC<CancelReservationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  isHost,
  isLoading
}) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const refundInfo = useMemo(() => {
    if (!reservation) return null;

    if (isHost) {
      return { amount: reservation.totalPrice, type: 'full', text: t.cancel_modal_host_refund || "As a host, the guest gets a full refund." };
    }

    const now = new Date();
    // Assuming type LISTING or EXPERIENCE
    const checkInDate = reservation.type === "LISTING" ? reservation.checkIn : (reservation.session as any)?.dateTime;
    if (!checkInDate) return { amount: 0, type: 'none' };

    const hoursUntilCheckIn = (new Date(checkInDate).getTime() - now.getTime()) / (1000 * 60 * 60);
    const policy = reservation.cancellationPolicy || "FLEXIBLE";
    let refundAmount = 0;

    if (policy === "FLEXIBLE") {
      if (hoursUntilCheckIn >= 24) refundAmount = reservation.totalPrice;
    } else if (policy === "MODERATE") {
      if (hoursUntilCheckIn >= 120) refundAmount = reservation.totalPrice;
    } else if (policy === "STRICT") {
      if (hoursUntilCheckIn >= 168) refundAmount = Math.floor(reservation.totalPrice * 0.5);
    } else if (policy === "NON_REFUNDABLE") {
      refundAmount = 0;
    }

    if (refundAmount === reservation.totalPrice) return { amount: refundAmount, type: 'full' };
    if (refundAmount > 0) return { amount: refundAmount, type: 'partial' };
    return { amount: 0, type: 'none' };

  }, [reservation, isHost, t]);

  let bodyContent = (
    <div className="flex flex-col gap-4">
      <p className="text-neutral-500">{t.cancel_modal_subtitle || "Are you sure you want to cancel?"}</p>
    </div>
  );

  if (reservation && refundInfo) {
    const policyKey = `policy_${(reservation.cancellationPolicy || "FLEXIBLE").toLowerCase()}`;
    const policyText = t[policyKey] || reservation.cancellationPolicy || "Flexible";

    bodyContent = (
      <div className="flex flex-col gap-6">
        <p className="text-neutral-500 font-medium text-lg">
          {t.cancel_modal_subtitle || "Are you sure you want to cancel this trip?"}
        </p>
        
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-neutral-800">{t.cancel_modal_policy || "Cancellation policy:"}</span>
            <span className="text-neutral-600 font-medium text-sm">
              {policyText}
            </span>
          </div>

          <hr className="border-neutral-200" />

          <div className="flex flex-col gap-1">
            {refundInfo.type === 'full' && (
              <span className="text-teal-600 font-bold">{isHost ? refundInfo.text : (t.cancel_modal_refund_full || "You will be fully refunded:")}</span>
            )}
            {refundInfo.type === 'partial' && (
              <span className="text-amber-600 font-bold">{t.cancel_modal_refund_partial || "You will be partially refunded:"}</span>
            )}
            {refundInfo.type === 'none' && (
              <span className="text-rose-600 font-bold">{t.cancel_modal_refund_none || "No refund will be issued."}</span>
            )}
            
            {refundInfo.amount > 0 && !isHost && (
              <span className="text-3xl font-black text-neutral-900 mt-2">
                €{refundInfo.amount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onConfirm}
      title={t.cancel_modal_title || "Cancel Reservation"}
      actionLabel={t.cancel_modal_confirm || "Yes, cancel"}
      secondaryActionLabel={t.cancel_modal_abort || "No, keep my reservation"}
      secondaryAction={onClose}
      disabled={isLoading}
      body={bodyContent}
    />
  );
};

export default CancelReservationModal;
