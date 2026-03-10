import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-heading-1 text-bleu-nuit">Contactez-nous</h1>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Une question ? Un besoin spécifique ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <Mail className="mt-1 h-5 w-5 text-or" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">contact@aqarvision.dz</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <Phone className="mt-1 h-5 w-5 text-or" />
                <div>
                  <h3 className="font-semibold">Téléphone</h3>
                  <p className="text-sm text-muted-foreground">+213 555 00 00 00</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <MapPin className="mt-1 h-5 w-5 text-or" />
                <div>
                  <h3 className="font-semibold">Adresse</h3>
                  <p className="text-sm text-muted-foreground">Alger, Algérie</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <form className="space-y-4">
                <Input placeholder="Votre nom *" required />
                <Input type="email" placeholder="Votre email *" required />
                <Input placeholder="Sujet" />
                <Textarea placeholder="Votre message *" rows={5} required />
                <Button type="submit" className="w-full" variant="or">
                  Envoyer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
