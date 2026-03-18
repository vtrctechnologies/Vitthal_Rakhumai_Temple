import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50  py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 md:p-12">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500">Last Updated: November 24, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to the official website of the{" "}
              <span className="font-semibold text-gray-900">
                Vitthal Rakhumai Temple
              </span>
              . We respect the privacy of our devotees and are committed to
              protecting the personal information you share with us. This policy
              outlines our practices regarding data collection and usage.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We collect information to facilitate donations, pooja bookings,
              and communication:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong className="text-gray-800">Personal Details:</strong>{" "}
                Name, contact number, email address, and postal address.
              </li>
              <li>
                <strong className="text-gray-800">Donation Compliance:</strong>{" "}
                Permanent Account Number (PAN) is collected for donations as
                required by Indian Income Tax regulations for 80G exemptions.
              </li>
              <li>
                <strong className="text-gray-800">Technical Data:</strong> IP
                address, browser type, and usage patterns to improve our website
                security.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              3. How We Use Your Information
            </h2>
            <p>Your data is used strictly for temple-related activities:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3 text-gray-600">
              <li>Processing donations and issuing official receipts.</li>
              <li>
                Communicating details about upcoming Utsavs, festivals, and
                temple timings.
              </li>
              <li>Coordinating Abhishek or Pooja bookings.</li>
              <li>Internal record keeping and legal compliance.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              4. Payment Security
            </h2>
            <p>
              We prioritize the security of your financial transactions. We do
              not store your credit card, debit card, or net banking passwords.
              All online donations are processed through secure, encrypted
              third-party payment gateways.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-amber-700 mb-3">
              5. Contact Us
            </h2>
            <p className="mb-4">
              If you have any questions regarding this Privacy Policy, please
              contact the Temple Seva Mandal:
            </p>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <p className="font-medium text-gray-900">
                Vitthal Rakhumai Temple Seva Mandal
              </p>
              <p>Ratnagiri, Maharashtra, India</p>
              <p className="mt-2">
                <span className="font-semibold">Email:</span>{" "}
                contact@yoursite.com
              </p>
              <p>
                <span className="font-semibold">Phone:</span> +91 00000 00000
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
