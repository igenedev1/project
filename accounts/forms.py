from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import password_validation,get_user_model

from django.core.exceptions import ValidationError

from django import forms

User=get_user_model()




class UserLoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super(UserLoginForm, self).__init__(*args, **kwargs)

    username = forms.CharField(
        widget=forms.TextInput(
            attrs={
                "class": "form-control form-text-box",
                "placeholder": "Username",
                "onkeypress": "resetField(this)",
                "autocomplete": "off",
            }
        )
    )
    password = forms.CharField(
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control form-text-box",
                "placeholder": "Password",
                "onkeypress": "resetField(this)",
                "autocomplete": "off",
            }
        )
    )

    def clean(self):
        cleaned_data = super().clean()
        print("cleaned here", cleaned_data)
        print(
            "user",
            super().get_user().username,
            "auth",
            super().get_user().is_authenticated,
        )
        return cleaned_data

class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    error_messages = {
        'password_mismatch': 'The two password fields didn’t match.',
    }
    password1 = forms.CharField(
        label='Password',
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        help_text=password_validation.password_validators_help_text_html(),
        )
    password2 = forms.CharField(
        label="Password confirmation",
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password'}),
        strip=False,
        help_text="Enter the same password as before, for verification.",
        )

    class Meta:
        model = User
        fields = ('email','username','dept','doj','igene_id','usertype')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

    def _post_clean(self):
        super()._post_clean()
        # Validate the password after self.instance is updated with form data
        # by super().
        password = self.cleaned_data.get('password2')
        if password:
            try:
                password_validation.validate_password(password, self.instance)
            except ValidationError as error:
                self.add_error('password2', error)

class CustomUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):
        model = User
                
        fields = ('email','username','designation','dept','doj','igene_id','usertype')