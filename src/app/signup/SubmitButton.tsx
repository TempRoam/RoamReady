"use client";

import React from "react";
import { useFormStatus } from "react-dom"; //says when the form is being submitted

type SubmitButtonInfo = { //SubmitButtonInfo to describe the info the button receives
    children: React.ReactNode; //button text
    pendingText: string; //the text that shows while pending
    className?: string; //for styling the button
};

export default function SubmitButton({ //SubmitButton, actual button
    children,
    pendingText,
    className,
}: SubmitButtonInfo) {

    const { pending } = useFormStatus();

    return(
        <button
        type="submit"
        className={className}
        disabled={pending}
        >
            {pending ? pendingText : children}
        </button>
    );

}