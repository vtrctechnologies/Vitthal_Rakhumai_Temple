import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="bg-gray-50  py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 md:p-12">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Terms & Refund Policy
          </h1>
          <p className="text-gray-500">Last Updated: November 24, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1: General Terms */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              1. General Terms of Use
            </h2>
            <p>
              By accessing the website of{" "}
              <span className="font-semibold text-gray-900">
                Vitthal Rakhumai Temple Seva Mandal
              </span>
              , you agree to abide by the terms regarding donations, pooja
              bookings, and content usage. The Seva Mandal reserves the right to
              modify these terms at any time without prior notice.
            </p>
          </section>

          {/* Section 2: Donation Refund Policy */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              2. Donation Refund Policy
            </h2>
            <p className="mb-3">
              Donations made to the Temple Seva Mandal are generally{" "}
              <strong>non-refundable</strong>. The decision of the Seva Mandal
              regarding refunds shall be final and binding. However, exceptions
              may be made in the following specific technical scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong className="text-gray-800">
                  Duplicate Transactions:
                </strong>{" "}
                If the same amount is deducted twice from your bank account due
                to a server error.
              </li>
              <li>
                <strong className="text-gray-800">Technical Glitches:</strong>{" "}
                If the amount deducted exceeds the amount entered by the donor
                due to a technical fault.
              </li>
            </ul>
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 text-sm text-amber-900">
              <strong>Note:</strong> No refunds will be issued for "change of
              mind" once the 80G Tax Exemption receipt has been generated.
            </div>
          </section>

          {/* Section 4: Refund Process */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              3. Processing Timeline
            </h2>
            <p>
              If your case falls under the valid refund criteria, please contact
              us within <strong>7 days</strong> of the transaction. Approved
              refunds will be processed via the original mode of payment within{" "}
              <strong>7 to 10 working days</strong>.
            </p>
          </section>

          {/* Section 5: Jurisdiction */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              4. Legal Jurisdiction
            </h2>
            <p>
              These terms and conditions shall be governed by the laws of India.
              Any disputes arising out of the use of this website or donations
              shall be subject to the exclusive jurisdiction of the courts in{" "}
              <strong>Ratnagiri, Maharashtra</strong>.
            </p>
          </section>

          {/* Contact Box */}
          <section className="pt-4">
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Request a Refund
              </h3>
              <p className="mb-4 text-sm">
                Please email us with your <strong>Transaction ID</strong>,{" "}
                <strong>Date of Donation</strong>, and{" "}
                <strong>Reason for Refund</strong>.
              </p>
              <p className="font-semibold text-amber-700">
                Email: support@yoursite.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
