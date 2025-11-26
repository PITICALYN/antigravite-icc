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
        'use_social_name': 'entry.1491378407', // Checkbox - Expects "sim"
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
        // 'race_other': 'entry.MISSING', // Handled via logic
        'cultural_area': 'entry.1352902010', // Checkboxes
        'cultural_other': 'entry.126170279',
        'experience_time': 'entry.276516650',
        'work_description': 'entry.1635954645',
        'portfolio_site': 'entry.1502285931',
        'facebook_user': 'entry.1364402133',
        // 'instagram_user': 'entry.MISSING', // Not in form
        'collective_participation': 'entry.1150245970',
        'collective_name': 'entry.554285331', // Added ID
        'image_auth': 'entry.858060365',
        'participation_auth': 'entry.1110992509',
        'comm_auth': 'entry.30914039',
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
            iframe.name = 'hidden_iframe';
            iframe.id = 'hidden_iframe';
            // DEBUG: Make iframe visible to see errors
            iframe.style.display = 'block';
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = '2px solid red';
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
            'producao': 'Produção Cultural',
            'fotografia': 'Fotografia',
            'audiovisual': 'Audiovisual',
            'outros': 'Outros',
            // Radios & Checkboxes
            'sim': 'Sim',
            'nao': 'Não',
            'on': 'Sim', // Default 'on' for checkbox -> 'Sim' (Uppercase) for Social Name
            // Education
            'fundamental': 'Fundamental',
            'medio': 'Médio',
            'tecnico': 'Médio Técnico',
            'superior_incompleto': 'Superior',
            'superior_completo': 'Superior',
            'pos_graduacao': 'Pós - Graduação',
            // Gender
            'feminino': 'Mulher',
            'masculino': 'Homem',
            'nao_binario': 'Não- Binário', // Space intentional
            'transgenero': 'Travesti', // Closest match in form
            'outro': 'Outro',
            'prefiro_nao_dizer': 'Prefiro não responder',
            // Race
            'branca': 'Branca',
            'preta': 'Preta',
            'parda': 'Parda',
            'amarela': 'Amarela',
            'indigena': 'Indígena',
            // 'outra': Handled separately
        };

        // Populate the temp form with mapped data
        console.log('--- Form Submission Data ---');
        for (const [htmlName, googleEntryId] of Object.entries(fieldMapping)) {
            let val = formData.get(htmlName);

            if (!val) continue; // Skip empty fields

            if (htmlName === 'cultural_area') {
                // Handle multi-checkboxes
                const values = formData.getAll(htmlName);
                values.forEach(v => {
                    const mappedVal = valueMap[v] || v;
                    console.log(`${htmlName} [${googleEntryId}]: ${mappedVal}`);
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = googleEntryId;
                    input.value = mappedVal;
                    tempForm.appendChild(input);
                });
            }
            else if (htmlName === 'race') {
                // Special handling for Race "Outra"
                if (val === 'outra') {
                    const otherVal = formData.get('race_other');
                    if (otherVal) {
                        console.log(`${htmlName} (Other) [${googleEntryId}]: ${otherVal}`);
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = googleEntryId;
                        input.value = otherVal; // Send the text directly to the radio ID
                        tempForm.appendChild(input);
                    }
                } else {
                    const mappedVal = valueMap[val] || val;
                    console.log(`${htmlName} [${googleEntryId}]: ${mappedVal}`);
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = googleEntryId;
                    input.value = mappedVal;
                    tempForm.appendChild(input);
                }
            }
            else if (htmlName === 'use_social_name') {
                // Checkbox expects "Sim"
                console.log(`${htmlName} [${googleEntryId}]: Sim`);
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = googleEntryId;
                input.value = 'Sim';
                tempForm.appendChild(input);
            }
            else if (htmlName === 'facebook_user') {
                const prefix = 'facebook.com/';
                console.log(`${htmlName} [${googleEntryId}]: ${prefix + val}`);
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = googleEntryId;
                input.value = prefix + val;
                tempForm.appendChild(input);
            }
            else if (htmlName === 'instagram_user') {
                const prefix = 'instagram.com/';
                console.log(`${htmlName} [${googleEntryId}]: ${prefix + val}`);
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = googleEntryId;
                input.value = prefix + val;
                tempForm.appendChild(input);
            }
            else if (htmlName === 'privacy_policy') {
                const policyVal = 'Li e concordo com a Política de Privacidade';
                console.log(`${htmlName} [${googleEntryId}]: ${policyVal}`);
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = googleEntryId;
                input.value = policyVal;
                tempForm.appendChild(input);
            }
            else {
                // Standard fields
                const mappedVal = valueMap[val] || val;
                console.log(`${htmlName} [${googleEntryId}]: ${mappedVal}`);
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = googleEntryId;
                input.value = mappedVal;
                tempForm.appendChild(input);
            }
        }
        console.log('----------------------------');

        // Add required hidden fields for Google Forms validation
        const hiddenFields = {
            'fvv': '1',
            'fbzx': '6653372783592602984',
            'pageHistory': '0'
        };

        for (const [name, value] of Object.entries(hiddenFields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            tempForm.appendChild(input);
        }

        console.log('--- Hidden Fields Added ---');
        console.log(hiddenFields);
        console.log('----------------------------');

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
