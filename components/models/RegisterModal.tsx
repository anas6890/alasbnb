"use client";

import useLoginModel from "@/hook/useLoginModal";
import useRegisterModal from "@/hook/useRegisterModal";
import axios from "axios";
import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { AiFillFacebook } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

import { signIn } from "next-auth/react";
import Button from "../Button";
import Heading from "../Heading";
import Input from "../inputs/Input";
import { translations } from "@/lib/translations";
import useLanguage from "@/hook/useLanguage";
import Modal from "./Modal";

type Props = {};

function RegisterModal({ }: Props) {
  const registerModel = useRegisterModal();
  const loginModel = useLoginModel();
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      firstname: "",
      lastname: "",
      birthdate: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios
      .post("/api/register", data)
      .then(() => {
        toast.success(t.register_success || "Register Successfully");
        loginModel.onOpen();
        registerModel.onClose();
      })
      .catch((err: any) => {
        toast.error(t.error_occurred || "Something Went Wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { callbackUrl: "/" });
  };

  const toggle = useCallback(() => {
    loginModel.onOpen();
    registerModel.onClose();
  }, [loginModel, registerModel]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title={t.welcome_airbnb}
        subtitle={t.create_account}
        center
      />
      <Input
        id="email"
        label={t.email}
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="firstname"
        label={t.firstname}
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="lastname"
        label={t.lastname}
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="birthdate"
        label={t.birthdate}
        type="date"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label={t.password}
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button
        outline
        label={t.continue_google}
        icon={FcGoogle}
        disabled={isLoading}
        onClick={() => socialAction("google")}
      />
      <Button
        outline
        label={t.continue_facebook}
        icon={AiFillFacebook}
        disabled={isLoading}
        onClick={() => socialAction("facebook")}
        isColor
      />
      <div className="text-neutral-500 text-center mt-4 font-light">
        <div>
          {t.already_account}{" "}
          <span
            onClick={toggle}
            className="text-neutral-800 cursor-pointer hover:underline"
          >
            {t.login}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModel.isOpen}
      title={t.signup}
      actionLabel={t.submit}
      onClose={registerModel.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default RegisterModal;
