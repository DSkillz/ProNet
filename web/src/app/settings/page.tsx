"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Globe,
  Eye,
  Mail,
  Smartphone,
  Save,
  ArrowLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi, api } from "@/lib/api";
import Link from "next/link";

type SettingsTab =
  | "profile"
  | "password"
  | "notifications"
  | "privacy"
  | "appearance";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "password", label: "Mot de passe", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Confidentialité", icon: Shield },
  { id: "appearance", label: "Apparence", icon: Palette },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    location: "",
    about: "",
    isOpenToWork: false,
    isHiring: false,
  });

  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailConnections: true,
    emailMessages: true,
    emailJobs: true,
    emailNews: false,
    pushConnections: true,
    pushMessages: true,
    pushMentions: true,
    pushLikes: false,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: "connections",
    showActivityStatus: true,
    showLastSeen: true,
  });

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    language: "fr",
    fontSize: "medium",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        headline: user.headline || "",
        location: user.location || "",
        about: user.about || "",
        isOpenToWork: user.isOpenToWork || false,
        isHiring: user.isHiring || false,
      });
    }
  }, [user]);

  const showMessage = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message);
      setErrorMessage("");
    } else {
      setErrorMessage(message);
      setSuccessMessage("");
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const result = await usersApi.updateProfile(profileData);
      if (result.error) {
        showMessage("error", result.error);
      } else {
        showMessage("success", "Profil mis à jour avec succès !");
      }
    } catch (error) {
      showMessage("error", "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showMessage("error", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSaving(true);
    try {
      const result = await api.patch("/api/users/me/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (result.error) {
        showMessage("error", result.error);
      } else {
        showMessage("success", "Mot de passe modifié avec succès !");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      showMessage("error", "Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    // Simulated save - would connect to API
    setTimeout(() => {
      showMessage("success", "Préférences de notification enregistrées !");
      setIsSaving(false);
    }, 500);
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    // Simulated save - would connect to API
    setTimeout(() => {
      showMessage("success", "Paramètres de confidentialité enregistrés !");
      setIsSaving(false);
    }, 500);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    // Simulated save - would connect to API
    setTimeout(() => {
      showMessage("success", "Préférences d'apparence enregistrées !");
      setIsSaving(false);
    }, 500);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="animate-pulse text-neutral-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-500 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au fil d'actualité</span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Paramètres</h1>
          <p className="text-neutral-600 mt-1">
            Gérez vos préférences de compte et vos paramètres
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <Check className="h-5 w-5" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="lg:col-span-1 p-2 h-fit">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-600"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>

          {/* Content */}
          <Card className="lg:col-span-3 p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Informations du profil
                  </h2>
                  <p className="text-neutral-600 text-sm mt-1">
                    Ces informations seront affichées sur votre profil public
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Prénom
                    </label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Nom
                    </label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Titre professionnel
                  </label>
                  <Input
                    value={profileData.headline}
                    onChange={(e) =>
                      setProfileData({ ...profileData, headline: e.target.value })
                    }
                    placeholder="Ex: Développeur Full Stack chez TechCorp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Localisation
                  </label>
                  <Input
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({ ...profileData, location: e.target.value })
                    }
                    placeholder="Ex: Paris, France"
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    À propos
                  </label>
                  <textarea
                    value={profileData.about}
                    onChange={(e) =>
                      setProfileData({ ...profileData, about: e.target.value })
                    }
                    placeholder="Décrivez votre parcours, vos compétences et vos objectifs..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.isOpenToWork}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          isOpenToWork: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">
                      Ouvert aux opportunités
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.isHiring}
                      onChange={(e) =>
                        setProfileData({ ...profileData, isHiring: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">
                      En train de recruter
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Changer le mot de passe
                  </h2>
                  <p className="text-neutral-600 text-sm mt-1">
                    Assurez-vous d'utiliser un mot de passe fort et unique
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Minimum 8 caractères avec majuscules, minuscules et chiffres
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                  <Button onClick={handleChangePassword} disabled={isSaving}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isSaving ? "Modification..." : "Modifier le mot de passe"}
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Préférences de notification
                  </h2>
                  <p className="text-neutral-600 text-sm mt-1">
                    Choisissez comment vous souhaitez être notifié
                  </p>
                </div>

                {/* Email Notifications */}
                <div>
                  <h3 className="flex items-center gap-2 font-medium text-neutral-900 mb-3">
                    <Mail className="h-4 w-4" />
                    Notifications par email
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "emailConnections", label: "Nouvelles demandes de connexion" },
                      { key: "emailMessages", label: "Nouveaux messages" },
                      { key: "emailJobs", label: "Offres d'emploi correspondant à mon profil" },
                      { key: "emailNews", label: "Actualités et newsletters ProNet" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="flex items-center gap-2 font-medium text-neutral-900 mb-3">
                    <Smartphone className="h-4 w-4" />
                    Notifications push
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "pushConnections", label: "Demandes de connexion acceptées" },
                      { key: "pushMessages", label: "Nouveaux messages" },
                      { key: "pushMentions", label: "Mentions dans les publications" },
                      { key: "pushLikes", label: "J'aime sur mes publications" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Enregistrement..." : "Enregistrer les préférences"}
                  </Button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Confidentialité et sécurité
                  </h2>
                  <p className="text-neutral-600 text-sm mt-1">
                    Contrôlez qui peut voir vos informations
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Profile Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Eye className="h-4 w-4 inline mr-2" />
                      Visibilité du profil
                    </label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profileVisibility: e.target.value,
                        })
                      }
                      className="w-full max-w-xs px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="public">Public (visible par tous)</option>
                      <option value="connections">Connexions uniquement</option>
                      <option value="private">Privé (vous uniquement)</option>
                    </select>
                  </div>

                  {/* Who can message */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Qui peut m'envoyer des messages ?
                    </label>
                    <select
                      value={privacySettings.allowMessagesFrom}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allowMessagesFrom: e.target.value,
                        })
                      }
                      className="w-full max-w-xs px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="everyone">Tout le monde</option>
                      <option value="connections">Mes connexions uniquement</option>
                      <option value="nobody">Personne</option>
                    </select>
                  </div>

                  {/* Toggle options */}
                  <div className="space-y-3 pt-4">
                    {[
                      { key: "showEmail", label: "Afficher mon adresse email sur mon profil" },
                      { key: "showPhone", label: "Afficher mon numéro de téléphone sur mon profil" },
                      { key: "showActivityStatus", label: "Montrer quand je suis en ligne" },
                      { key: "showLastSeen", label: "Afficher ma dernière connexion" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings[item.key as keyof typeof privacySettings] as boolean}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                  <Button onClick={handleSavePrivacy} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Enregistrement..." : "Enregistrer les paramètres"}
                  </Button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Apparence et affichage
                  </h2>
                  <p className="text-neutral-600 text-sm mt-1">
                    Personnalisez l'apparence de ProNet
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Thème
                    </label>
                    <div className="flex gap-4">
                      {[
                        { value: "light", label: "Clair", icon: "☀️" },
                        { value: "dark", label: "Sombre", icon: "🌙" },
                        { value: "system", label: "Système", icon: "💻" },
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() =>
                            setAppearanceSettings({
                              ...appearanceSettings,
                              theme: theme.value,
                            })
                          }
                          className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-colors ${
                            appearanceSettings.theme === theme.value
                              ? "border-primary-500 bg-primary-50"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <span className="text-2xl">{theme.icon}</span>
                          <span className="text-sm font-medium">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Langue
                    </label>
                    <select
                      value={appearanceSettings.language}
                      onChange={(e) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          language: e.target.value,
                        })
                      }
                      className="w-full max-w-xs px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Taille du texte
                    </label>
                    <select
                      value={appearanceSettings.fontSize}
                      onChange={(e) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          fontSize: e.target.value,
                        })
                      }
                      className="w-full max-w-xs px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="small">Petit</option>
                      <option value="medium">Moyen</option>
                      <option value="large">Grand</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-200">
                  <Button onClick={handleSaveAppearance} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Enregistrement..." : "Enregistrer les préférences"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
