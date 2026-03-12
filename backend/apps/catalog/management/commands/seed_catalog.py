from django.core.management.base import BaseCommand

from apps.catalog.models import Style, Voice, Music
from apps.payments.models import Plan


STYLES = [
    {'key': 'anime', 'name': 'Anime', 'emoji': '⚔️', 'is_new': False, 'order': 1},
    {'key': 'biblia', 'name': 'Biblia', 'emoji': '📖', 'is_new': True, 'order': 2},
    {'key': 'cartoon', 'name': 'Cartoon', 'emoji': '🎭', 'is_new': False, 'order': 3},
    {'key': 'cinematografico', 'name': 'Cinematografico', 'emoji': '🎥', 'is_new': False, 'order': 4},
    {'key': 'comic', 'name': 'Comic', 'emoji': '💥', 'is_new': False, 'order': 5},
    {'key': 'fantasia', 'name': 'Fantasia', 'emoji': '🧞', 'is_new': False, 'order': 6},
    {'key': 'terror', 'name': 'Terror', 'emoji': '👻', 'is_new': False, 'order': 7},
    {'key': 'fotorrealista', 'name': 'Fotorrealista', 'emoji': '📸', 'is_new': False, 'order': 8},
    {'key': 'ciencia_ficcion', 'name': 'Ciencia Ficcion', 'emoji': '🔮', 'is_new': False, 'order': 9},
    {'key': 'pixel_art', 'name': 'Arte Pixelado', 'emoji': '👾', 'is_new': False, 'order': 10},
    {'key': 'lego', 'name': 'Lego', 'emoji': '🧱', 'is_new': False, 'order': 11},
    {'key': 'minecraft', 'name': 'Minecraft', 'emoji': '⛏️', 'is_new': False, 'order': 12},
]

VOICES = [
    {'id': 'voice_miguel', 'name': 'Miguel', 'desc': 'Deep, Rich and Cinematic', 'tags': 'male, middle_aged, latin american, entertainment_tv', 'gender': 'm'},
    {'id': 'voice_david', 'name': 'David Martin', 'desc': 'Confident and Balanced', 'tags': 'male, young, peninsular, narrative_story', 'gender': 'm'},
    {'id': 'voice_marcela', 'name': 'Marcela', 'desc': 'Youthful, Smooth and Natural', 'tags': 'female, young, colombian, conversational', 'gender': 'f'},
    {'id': 'voice_sara', 'name': 'Sara Martin', 'desc': 'Gentle and Layered', 'tags': 'female, middle_aged, peninsular, educational', 'gender': 'f'},
    {'id': 'voice_alberto', 'name': 'Alberto Rodriguez', 'desc': 'Serious, Narrative', 'tags': 'male, middle_aged, latin american, narrative_story', 'gender': 'm'},
    {'id': 'voice_rada', 'name': 'Rada', 'desc': 'Relaxed, Confident, Calm', 'tags': 'male, young, latin american, narrative_story', 'gender': 'm'},
    {'id': 'voice_martin', 'name': 'Martin Alvarez', 'desc': 'Soothing and Hopeful', 'tags': 'male, middle_aged, latin american, narrative_story', 'gender': 'm'},
    {'id': 'voice_veronica', 'name': 'Veronica', 'desc': 'Warm, Soft and Inviting', 'tags': 'female, young, latin american, narrative_story', 'gender': 'f'},
    {'id': 'voice_fernando', 'name': 'Fernando Martinez', 'desc': 'Rapid, Persuasive', 'tags': 'male, middle_aged, latin american, narrative_story', 'gender': 'm'},
    {'id': 'voice_horacio', 'name': 'Horacio', 'desc': 'Natural, Warm and Confident', 'tags': 'male, middle_aged, colombian, social_media', 'gender': 'm'},
    {'id': 'voice_mario', 'name': 'Mario', 'desc': 'Animated and chatty', 'tags': 'male, young, latin american, conversational', 'gender': 'm'},
    {'id': 'voice_lucia', 'name': 'Lucia', 'desc': 'ASMR Serene Whispering', 'tags': 'female, young, british, social_media, asmr', 'gender': 'f'},
    {'id': 'voice_valentina', 'name': 'Valentina', 'desc': 'Energetic and Clear', 'tags': 'female, young, colombian, conversational', 'gender': 'f'},
    {'id': 'voice_carlos', 'name': 'Carlos', 'desc': 'Storytelling, Peruvian', 'tags': 'male, young, peruvian, narrative_story', 'gender': 'm'},
    {'id': 'voice_benjamin', 'name': 'Benjamin', 'desc': 'Deep, Smooth and Rich', 'tags': 'male, old, mexican, narrative_story', 'gender': 'm'},
    {'id': 'voice_diana', 'name': 'Diana', 'desc': 'Tranquil Meditation', 'tags': 'female, young, colombian, asmr, meditation', 'gender': 'f'},
    {'id': 'voice_jaime', 'name': 'Jaime', 'desc': 'Confident, Clear and Warm', 'tags': 'male, middle_aged, peninsular, narrative_story', 'gender': 'm'},
    {'id': 'voice_carmelo', 'name': 'Carmelo', 'desc': 'Mature, Mysterious and Clear', 'tags': 'male, old, latin american, entertainment_tv', 'gender': 'm'},
]

MUSIC = [
    {'id': 'epico_1', 'name': 'Epico Cinematografico', 'category': 'epic'},
    {'id': 'epico_2', 'name': 'Hibrido Orquestal Grandioso', 'category': 'epic'},
    {'id': 'epico_3', 'name': 'Batalla Heroica', 'category': 'epic'},
    {'id': 'epico_4', 'name': 'Victoria Triunfante', 'category': 'epic'},
    {'id': 'epico_5', 'name': 'Aventura Espacial', 'category': 'epic'},
    {'id': 'epico_6', 'name': 'Viaje Majestuoso', 'category': 'epic'},
    {'id': 'terror_1', 'name': 'Misterio Escalofriante', 'category': 'terror'},
    {'id': 'terror_2', 'name': 'Suspense Oscuro', 'category': 'terror'},
    {'id': 'terror_3', 'name': 'Pulso de Terror', 'category': 'terror'},
    {'id': 'terror_4', 'name': 'Detective Noir', 'category': 'terror'},
    {'id': 'happy_1', 'name': 'Energia Positiva', 'category': 'happy'},
    {'id': 'happy_2', 'name': 'Alegre y Animado', 'category': 'happy'},
    {'id': 'happy_3', 'name': 'Motivacional Sunrise', 'category': 'happy'},
    {'id': 'lofi_1', 'name': 'Lofi Relajante', 'category': 'lofi'},
    {'id': 'lofi_2', 'name': 'Meditacion Profunda', 'category': 'lofi'},
    {'id': 'lofi_3', 'name': 'Drama Emocional', 'category': 'lofi'},
    {'id': 'drama_1', 'name': 'Epico Motivacional', 'category': 'drama'},
    {'id': 'drama_2', 'name': 'Momento Epico', 'category': 'drama'},
]

PLANS = [
    {
        'name': 'starter',
        'display_name': 'Starter',
        'price_pen': 34.00,
        'price_original_pen': 52.00,
        'credits': 100,
        'videos_per_period': 10,
        'period': 'weekly',
        'is_popular': False,
        'order': 1,
        'features': [
            '10 videos por semana',
            '100 creditos incluidos',
            'Edicion completa',
            'Clips de video animados',
            'Subtitulos y emojis animados',
            '50+ idiomas',
            'Voces realistas IA',
            'Uso comercial incluido',
        ],
    },
    {
        'name': 'basic',
        'display_name': 'Basico',
        'price_pen': 78.00,
        'price_original_pen': 94.00,
        'credits': 200,
        'videos_per_period': 20,
        'period': 'monthly',
        'is_popular': False,
        'order': 2,
        'features': [
            '20 videos por mes',
            '200 creditos incluidos',
            'Edicion completa',
            'Clips de video animados',
            'Subtitulos y emojis animados',
            '50+ idiomas',
            'Voces realistas IA',
            'Regenerar y subir imagenes',
            'Acceso a Sora 2',
            'Uso comercial incluido',
        ],
    },
    {
        'name': 'pro',
        'display_name': 'Profesional',
        'price_pen': 159.00,
        'price_original_pen': 200.00,
        'credits': 600,
        'videos_per_period': 60,
        'period': 'monthly',
        'is_popular': True,
        'order': 3,
        'features': [
            '60 videos por mes',
            '600 creditos incluidos',
            'Edicion completa avanzada',
            'Clips HD animados',
            'Subtitulos y emojis animados',
            '50+ idiomas',
            'Voces realistas IA premium',
            'Regenerar y subir imagenes',
            'Acceso a Sora 2',
            'Uso comercial incluido',
            'Auto-publicar en YouTube y TikTok',
            'Soporte prioritario 24/7',
        ],
    },
    {
        'name': 'ultimate',
        'display_name': 'Ultimate',
        'price_pen': 279.00,
        'price_original_pen': 350.00,
        'credits': 900,
        'videos_per_period': 90,
        'period': 'monthly',
        'is_popular': False,
        'order': 4,
        'features': [
            '90 videos por mes',
            '900 creditos incluidos',
            'Edicion completa premium',
            'Clips 4K animados',
            'Subtitulos y emojis animados',
            '80+ idiomas',
            'Voces clonadas personalizadas',
            'Regenerar y subir imagenes',
            'Acceso a Sora 2 incluido',
            'Uso comercial incluido',
            'Auto-publicar en 5 plataformas',
            '5 sub-cuentas incluidas',
            'Acceso completo a API',
            'Manager dedicado',
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the catalog with styles, voices, music and plans'

    def handle(self, *args, **options):
        # Styles
        for i, s in enumerate(STYLES, start=1):
            _, created = Style.objects.get_or_create(
                key=s['key'],
                defaults={
                    'name': s['name'],
                    'emoji': s['emoji'],
                    'is_new': s['is_new'],
                    'order': s['order'],
                },
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  {status}: Style {s['name']}")
        self.stdout.write(self.style.SUCCESS(f'Styles: {len(STYLES)} processed'))

        # Voices
        for i, v in enumerate(VOICES, start=1):
            _, created = Voice.objects.get_or_create(
                voice_id=v['id'],
                defaults={
                    'name': v['name'],
                    'description': v['desc'],
                    'tags': v['tags'],
                    'gender': v['gender'],
                    'order': i,
                },
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  {status}: Voice {v['name']}")
        self.stdout.write(self.style.SUCCESS(f'Voices: {len(VOICES)} processed'))

        # Music
        for i, m in enumerate(MUSIC, start=1):
            _, created = Music.objects.get_or_create(
                music_id=m['id'],
                defaults={
                    'name': m['name'],
                    'category': m['category'],
                    'order': i,
                },
            )
            status = 'Created' if created else 'Already exists'
            self.stdout.write(f"  {status}: Music {m['name']}")
        self.stdout.write(self.style.SUCCESS(f'Music: {len(MUSIC)} processed'))

        # Plans (update_or_create so data stays current)
        for p in PLANS:
            name = p.pop('name')
            _, created = Plan.objects.update_or_create(
                name=name,
                defaults=p,
            )
            p['name'] = name  # restore for logging
            status = 'Created' if created else 'Updated'
            self.stdout.write(f"  {status}: Plan {p.get('display_name', name)}")
        self.stdout.write(self.style.SUCCESS(f'Plans: {len(PLANS)} processed'))

        self.stdout.write(self.style.SUCCESS('Catalog seeding complete!'))
