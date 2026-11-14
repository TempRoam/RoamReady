/**
 * a) b) c)
 * Module SubmitButton
 * File   src/app/signup/SubmitButton.tsx
 * Date  created on: last updated: 
 * Programmer Daniela Chavez
 *
 *d) Description: 
 * This is the client component, "use client", that gives a reusable submit button. The button disbales itselfs and will change is shown text while the parent form is being submitted.
 * 
 *e) Important functions in each class:
 * @function SubmitButton
 * @param children React.ReactNode, the button text is shown when the form is not          *submitting.
 * @param pendingText string, the text is shown while the form is being submitted.
 *@param className string, the CSS class that is used to style the button.
 *@ returns, this is a JSK button element with type=”submit”, the button changes to *disabled during the time the parent form is submitting.
 * f) Data structures: 
 * SubmitButtonInfo, is a TypeScript object type that describes the *children, pendingText and className of the component properties. The *useFormStatus() is the react DOM hook that is used to return the pending submission *state of the parent form.
 * g) Algorithm: 
 * The component calls useFormStatus() and it checks the submission status *of its parent form. The button displays normal children text if the pending is false. If the *pending is true the button is then disabled. When submitting the button shows the *pendingText value and once submission finishes, the button then returns to its normal *text and enabled state.
 * Relies on: React, React DOM useFormStatus(), the Parent form using the component.
 */


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