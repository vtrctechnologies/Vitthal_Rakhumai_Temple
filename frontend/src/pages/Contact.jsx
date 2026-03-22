import { useState } from "react";
import { useInView } from "react-intersection-observer";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import { Input, Textarea } from "@/components/base/Input";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Swal from "sweetalert2";
import { contactAPI } from "@/services/api";

const Contact = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#d97706",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await contactAPI.sendMessage(formData);

      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Thank you for contacting us. We'll get back to you soon.",
          confirmButtonColor: "#d97706",
        });

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.response?.data?.message || "There was an error sending your message.",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gradient mb-6 animate-fade-in">
            Contact Us
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
          <p className="text-xl text-muted-foreground">
            We're here to answer your questions and assist you
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="p-6 text-center cursor-glow hover:shadow-lg transition-all">
                  <MapPin className="w-10 h-10 mx-auto text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-2">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    Vithal–Rakhumai Temple,
                    <br />
                    Ambere, Tal. Ratnagiri,
                    <br />
                    Dist. Ratnagiri, Maharashtra, India
                  </p>
                </Card>

                <Card className="p-6 text-center cursor-glow hover:shadow-lg transition-all">
                  <Phone className="w-10 h-10 mx-auto text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-2">Phone</h3>
                  <p className="text-sm text-muted-foreground">+91 9876543210</p>
                </Card>

                <Card className="p-6 text-center cursor-glow hover:shadow-lg transition-all">
                  <Mail className="w-10 h-10 mx-auto text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    templetrust@abc.com
                  </p>
                </Card>

                <Card className="p-6 text-center cursor-glow hover:shadow-lg transition-all">
                  <Clock className="w-10 h-10 mx-auto text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-2">Timings</h3>
                  <p className="text-sm text-muted-foreground">
                    Morning: 9 AM - 12 PM
                    <br />
                    Evening: 4 PM - 10 PM
                    <br />
                    All days open
                  </p>
                </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section
        ref={ref}
        className="py-16 px-4 bg-gradient-to-br from-secondary/5 to-primary/5"
      >
        <div
          className={`container mx-auto max-w-6xl ${
            inView ? "animate-fade-in" : "opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="p-8">
              <h2 className="text-3xl font-display font-bold mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Your Name *"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />

                <Input
                  label="Email Address *"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />

                <Input
                  label="Phone Number"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />

                <Input
                  label="Subject *"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  required
                />

                <Textarea
                  label="Your Message *"
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={6}
                  required
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg text-lg py-6"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>

            {/* Map */}
            <Card className="p-8">
              <h2 className="text-3xl font-display font-bold mb-6">
                Find Us Here
              </h2>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.1083838879717!2d73.33572137519744!3d16.810287083981756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bea717523ce896f%3A0x7d2fb257f2b9cc4d!2sVithhal%20Rakhumai%20Mandir%2C%20Amberkarwadi!5e1!3m2!1sen!2sin!4v1763733345074!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shree Vitthal Rakhumai Temple"
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  <strong>Note:</strong> The temple is easily accessible from
                  major highways. Parking facilities are available for devotees.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
