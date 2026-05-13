"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Button from "../Button";
import Input from "../inputs/Input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

interface ReviewInputProps {
  reservationId: string;
}

const ReviewInput: React.FC<ReviewInputProps> = ({ reservationId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/reviews", {
        reservationId,
        rating: data.rating,
        comment: data.comment,
      })
      .then(() => {
        toast.success("Review submitted!");
        reset();
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="mt-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <hr />
      <div className="text-sm font-semibold">Leave a Review</div>
      <Input
        id="rating"
        label="Rating (1-5)"
        type="number"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="comment"
        label="Comment"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Button
        small
        disabled={isLoading}
        label="Submit Review"
        onClick={handleSubmit(onSubmit)}
      />
    </div>
  );
};

export default ReviewInput;
