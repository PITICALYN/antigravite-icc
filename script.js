document.addEventListener('DOMContentLoaded', () => {

    // Toggle Helper Function
    const toggleField = (triggerId, targetId, conditionFn) => {
        const trigger = document.getElementById(triggerId);
        const target = document.getElementById(targetId);
        if (!trigger || !target) return;

        const handler = () => {
            if (conditionFn(trigger)) {
                target.classList.remove('hidden');
            } else {
                target.classList.add('hidden');
            }
        };

        trigger.addEventListener('change', handler);
        // Initial check
        handler();
    };

    // 1. Social Name
    toggleField('use_social_name', 'social_name_group', (t) => t.checked);

    // 2. Technical Course
    toggleField('education', 'technical_course_group', (t) => t.value === 'tecnico');

    // 3. Race Other
    toggleField('race', 'race_other_group', (t) => t.value === 'outra');

    // 3.1 Gender Other (New)
    toggleField('gender', 'gender_other_group', (t) => t.value === 'outro');

    // 4. Cultural Other
    toggleField('cultural_other_check', 'cultural_other_group', (t) => t.checked);

    // 5. Collective Name
    // For radios, we need to listen to all in the group or the specific 'yes' one
    const collectiveYes = document.getElementById('collective_yes');
    const collectiveNameGroup = document.getElementById('collective_name_group');

    const collectiveRadios = document.getElementsByName('collective_participation');
    collectiveRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (collectiveYes.checked) {
                collectiveNameGroup.classList.remove('hidden');
            } else {
                collectiveNameGroup.classList.add('hidden');
            }
        });
    });


    // Handle Form Submission
    const form = document.getElementById('registrationForm');

    // Google Forms Configuration
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfuj3MeHaFYq8pndme4um0ED9SXqiE6zBHGCnjmTKl05af_dQ/formResponse';

    // Field Mapping (HTML Name -> Google Entry ID)
    const fieldMapping = {
        'name': 'entry.548524210',
        'use_social_name': 'entry.1491378407', // Checkbox
        'social_name': 'entry.1494130951',
        'email': 'entry.477940854',
        'phone': 'entry.1924454278',
        'dob': 'entry.2032571322',
        'cep': 'entry.1452228749',
        'address': 'entry.1726215924',
        'neighborhood': 'entry.1526279772',
        'city': 'entry.1456950590',
        'education': 'entry.1752434772',
        'technical_course': 'entry.824618440',
        'gender': 'entry.466314194',
        'gender_other': 'entry.128321115',
        'race': 'entry.775361342',
        // 'race_other': 'entry.MISSING', // Not in provided link, might need update if user adds it
        'cultural_area': 'entry.1352902010', // Checkboxes
        'cultural_other': 'entry.126170279',
        'experience_time': 'entry.276516650',
        'work_description': 'entry.1635954645',
        'portfolio_site': 'entry.1502285931',
        'facebook_user': 'entry.1364402133',
        // 'instagram_user': 'entry.MISSING', // Not in provided link
        'collective_participation': 'entry.1150245970', // Corrected ID
        // 'collective_name': 'entry.MISSING', // Still missing from link, keeping generic or ignoring
        'image_auth': 'entry.858060365', // Corrected ID
        'participation_auth': 'entry.1110992509', // Corrected ID
        'comm_auth': 'entry.30914039', // Corrected ID
        'privacy_policy': 'entry.1778170175'
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'ENVIANDO...';
        submitBtn.disabled = true;

        // Create a hidden iframe to be the target of the form submission
        let iframe = document.getElementById('hidden_iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = 'hidden_iframe';
            iframe.id = 'hidden_iframe';
            iframe.style.display = 'none'; // Hidden iframe
            document.body.appendChild(iframe);
        }

        // Create a temporary form to submit to the iframe
        const tempForm = document.createElement('form');
        tempForm.action = GOOGLE_FORM_URL;
        tempForm.method = 'POST';
        tempForm.target = 'hidden_iframe';
        tempForm.style.display = 'none';

        const formData = new FormData(form);

        // Value Mapping for Google Forms (Internal Value -> Google Form Exact Text)
        const valueMap = {
            // Cultural Areas
            'bate_bola': 'Bate-Bola',
            'grafite': 'Grafite',
            'capoeira': 'Capoeira',
            'musica': 'Música',
            'danca': 'Dança',
            'maquiagem': 'Maquiagem Artística',
            'producao': 'Produçao Cultural', // Note: 'Produçao' without tilde in Google Form
            'fotografia': 'Fotografia',
            'audiovisual': 'Audiovisual',
            'outros': 'Outros',
            // Radios
            'sim': 'Sim',
            'nao': 'Não',
            // Privacy Policy
            'on': 'Li e concordo com a Politica de Privacidade' // Note: 'Politica' without accent in Google Form
        };

        // Populate the temp form with mapped data
        for (const [htmlName, googleEntryId] of Object.entries(fieldMapping)) {
            if (htmlName === 'cultural_area') {
                // Handle multi-checkboxes
                const values = formData.getAll(htmlName);
                values.forEach(val => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = googleEntryId;
                    input.value = valueMap[val] || val;
                    tempForm.appendChild(input);
                });
            } else if (htmlName === 'facebook_user' || htmlName === 'instagram_user') {
                // Handle prefixes
                const val = formData.get(htmlName);
                if (val) {
                    const prefix = htmlName === 'facebook_user' ? 'facebook.com/' : 'instagram.com/';
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = googleEntryId;
                    input.value = prefix + val;
                    tempForm.appendChild(input);
                }
            } else if (htmlName === 'privacy_policy') {
                // Handle privacy policy specific text
                const val = formData.get(htmlName);
                if (val) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = googleEntryId;
                    input.value = 'Li e concordo com a Politica de Privacidade'; // No accent
                    tempForm.appendChild(input);
                }
            } else {
                // Standard fields
                const val = formData.get(htmlName);
                if (val) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = googleEntryId;
                    input.value = valueMap[val] || val;
                    tempForm.appendChild(input);
                }
            }
        }

        document.body.appendChild(tempForm);
        tempForm.submit();

        // Since we can't reliably detect load on cross-origin iframe, we assume success after a delay
        setTimeout(() => {
            alert('Cadastro realizado com sucesso!');
            form.reset();

            // Reset conditionals
            document.querySelectorAll('.hidden').forEach(el => el.classList.add('hidden'));

            submitBtn.innerText = originalText;
            submitBtn.disabled = false;

            // Cleanup
            document.body.removeChild(tempForm);
        }, 2000);
    });
});
