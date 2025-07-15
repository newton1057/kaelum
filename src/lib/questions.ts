import type { SuggestedQuestion } from './types';

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: '1',
    question:
      'Una mujer de 30 años presenta antecedentes de picazón debajo de la mama derecha y presenta una lesión anular en el examen. ¿Cuál es el hongo más probable que causa esta afección?',
    reasoning:
      "Okay, so I need to figure out the most likely fungal organism causing an annular ring lesion under a 30-year-old female's right breast. Let me start by recalling what annular lesions usually indicate. An annular ring-shaped lesion is typical of certain skin infections. Since the question mentions a fungal organism, it's probably a type of dermatophyte infection. Dermatophytes are fungi that cause infections like tinea corporis (ringworm), tinea cruris (jock itch), and tinea pedis (athlete's foot). The location here is under the breast, which is a warm, moist area. That makes me think of tinea versicolor or maybe candidiasis, but tinea versicolor usually presents with discolored patches, not so much itching. Candidiasis can cause itching and redness in skin folds, but the annular lesion makes me lean more towards a dermatophyte. Wait, tinea corporis presents as an annular, scaly plaque with central clearing and an active red border. That fits the description here. The most common dermatophytes are Trichophyton, Microsporum, and Epidermophyton. Among these, Trichophyton species like T. rubrum are the most common cause of tinea corporis. But wait, the location is under the breast, which is a intertriginous area. Could it be tinea cruris instead? But tinea cruris usually affects the groin. However, dermatophytes can infect any body part, so maybe it's tinea corporis in an intertriginous area. Alternatively, Candida can cause infections in skin folds, presenting as red, macerated patches with satellite lesions. But Candida is a yeast, not a dermatophyte. The question specifies a fungal organism, which Candida is, but the annular ring makes me think more dermatophyte. However, sometimes Candida can have satellite lesions which might not be annular. Let me check some details. Tinea corporis typically has an annular appearance with central clearing and a scaly advancing border. The itching supports this. The location under the breast, being a warm and sweaty area, is a risk factor for fungal infections. So dermatophytes thrive there. The most common species causing tinea corporis is Trichophyton rubrum, followed by T. mentagrophytes and others. So the answer is likely Trichophyton rubrum. But I should also consider other possibilities. Could it be Microsporum? That's more common in tinea capitis. Epidermophyton causes tinea cruris and tinea pedis. Alternatively, is there a different fungal infection that presents with annular lesions? Pityriasis rosea is another annular rash, but that's viral and not fungal. So going back, the most probable is a dermatophyte, specifically Trichophyton species. Therefore, the most likely fungal organism is Trichophyton rubrum.",
    answer: `El hongo más probable que causa la lesión anular debajo de la mama es **Trichophyton rubrum**.

**Puntos clave:**
- **La lesión anular con picazón** es clásica de la **tinea corporis** (tiña), una infección por dermatofitos.
- **La ubicación** (pliegue cutáneo cálido y húmedo) favorece el crecimiento de hongos, y dermatofitos como las especies de *Trichophyton* prosperan en estos entornos.
- **Trichophyton rubrum** es el dermatofito más común responsable de la tiña corporis, que se caracteriza por placas eritematosas y escamosas con un centro claro y un borde activo.
- Otras posibilidades, como *Candida* (levadura), son menos probables debido a la morfología anular, más típica de los dermatofitos.

**Diagnóstico:** Tiña corporal causada por *Trichophyton rubrum*. **Próximos pasos:** Confirmar con microscopía de hidróxido de potasio (KOH) y tratar con antimicóticos tópicos (p. ej., clotrimazol, terbinafina).`,
  },
];
